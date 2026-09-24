"""Entity and Dimension Resolution Service.

Detects whether specific entity values or dimension column names were named in a user query,
identifies which column/dimension those entities belong to against the dataset's actual schema
and distinct values in DuckDB, and detects additional requested metric columns (e.g. units_sold).
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from app.core.duckdb import get_duckdb, list_tables, sanitize_table_name

logger = logging.getLogger("blackswan.core.entity_resolver")

ID_PATTERN = re.compile(
    r"(?:^|[_\W])(id|invoice|uuid|code|ref|identifier|pk|key|num|number)(?:[_\W]|$)|^(id|uuid|code|ref)$",
    re.IGNORECASE,
)

UNITS_KEYWORDS = re.compile(
    r"\b(unit|units|units_sold|quantity|qty|volume|pieces|items_sold)\b",
    re.IGNORECASE,
)

NUMERIC_TYPES = [
    "int", "bigint", "double", "float", "decimal", "hugeint", "smallint",
    "numeric", "real", "integer", "tinyint",
]


def find_registered_table(dataset_id_or_table: str) -> Optional[str]:
    """Find the exact table name in DuckDB for a given dataset_id or table_name."""
    try:
        tables = list_tables()
        if dataset_id_or_table in tables:
            return dataset_id_or_table
        sanitized = sanitize_table_name(dataset_id_or_table)
        if sanitized in tables:
            return sanitized
    except Exception as e:
        logger.debug("Could not query DuckDB list_tables: %s", e)
    return None


def resolve_query_dimension_and_entities(
    query: str,
    table_name_or_id: str,
    inferred_schema: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Inspect query against dataset schema and distinct values to detect:
    - dimension_col: The primary dimension column (e.g. 'Product', 'Region').
    - target_entities: List of specific entity values mentioned in the query (e.g. ['Product A', 'Product B']).
    - requested_metrics: List of specific metric columns requested (e.g. ['Units_Sold']).
    - units_col: Detected units/quantity column if present in table.
    """
    inferred_schema = inferred_schema or {}
    matched_by_dim: Dict[str, List[str]] = {}
    cand_dims: List[str] = []
    metric_cols: List[str] = []
    units_col: Optional[str] = None
    table_found = find_registered_table(table_name_or_id)

    if table_found:
        try:
            con = get_duckdb()
            desc = con.execute(f'DESCRIBE "{table_found}"').fetchall()
            cols_with_types = {r[0]: str(r[1]).lower() for r in desc}

            for col, dtype in cols_with_types.items():
                if any(nt in dtype for nt in NUMERIC_TYPES):
                    metric_cols.append(col)
                    if UNITS_KEYWORDS.search(col) and not units_col:
                        units_col = col
                elif any(t in dtype for t in ["varchar", "text", "string", "character"]):
                    if not ID_PATTERN.search(col):
                        # Verify column is not a pure date column
                        try:
                            date_check = con.execute(
                                f'SELECT COUNT(*) FROM "{table_found}" WHERE try_cast("{col}" AS DATE) IS NOT NULL'
                            ).fetchone()
                            total_cnt = con.execute(
                                f'SELECT COUNT(*) FROM "{table_found}"'
                            ).fetchone()
                            if date_check and total_cnt and total_cnt[0] > 0 and (date_check[0] / total_cnt[0]) > 0.5:
                                continue
                        except Exception:
                            pass
                        cand_dims.append(col)

            # Query actual distinct values for each candidate dimension and match against query
            for c in cand_dims:
                try:
                    rows = con.execute(
                        f'SELECT DISTINCT "{c}" FROM "{table_found}" WHERE "{c}" IS NOT NULL LIMIT 100'
                    ).fetchall()
                    vals = [r[0] for r in rows if r[0] is not None]
                    matched = []
                    for v in vals:
                        v_str = str(v).strip()
                        if len(v_str) >= 2 and re.search(rf"\b{re.escape(v_str)}\b", query, re.IGNORECASE):
                            matched.append(v_str)
                    if matched:
                        matched_by_dim[c] = matched
                except Exception as e:
                    logger.debug("Distinct check failed for column %s: %s", c, e)

        except Exception as e:
            logger.warning("Error inspecting DuckDB table %s: %s", table_found, e)

    # Fallback to inferred_schema if table inspection was unavailable or found no dimensions
    if not cand_dims and inferred_schema:
        columns_info = inferred_schema.get("columns", [])
        for col_info in columns_info:
            c_name = col_info.get("name")
            c_role = col_info.get("detected_role")
            if not c_name:
                continue
            if c_role == "dimension" and not ID_PATTERN.search(c_name):
                cand_dims.append(c_name)
                # Check sample values in schema
                sample_vals = col_info.get("sample_values") or []
                matched = [
                    str(sv).strip() for sv in sample_vals
                    if sv and len(str(sv).strip()) >= 2 and re.search(rf"\b{re.escape(str(sv).strip())}\b", query, re.IGNORECASE)
                ]
                if matched:
                    matched_by_dim[c_name] = matched
            elif c_role in ("revenue", "cogs", "other") and not ID_PATTERN.search(c_name):
                metric_cols.append(c_name)
                if UNITS_KEYWORDS.search(c_name) and not units_col:
                    units_col = c_name

    q_lower = query.lower()
    best_dim: Optional[str] = None
    target_entities: List[str] = []

    if matched_by_dim:
        # Sort dimensions by number of matched entities descending
        sorted_dims = sorted(matched_by_dim.items(), key=lambda x: len(x[1]), reverse=True)
        best_dim = sorted_dims[0][0]
        # Preserve original distinct order / casing
        target_entities = sorted_dims[0][1]
        logger.info(
            "EntityResolver: Detected dimension '%s' with named entities %s in query '%s'",
            best_dim, target_entities, query,
        )
    else:
        # Check if the query specifically mentions the dimension column name
        for c in cand_dims:
            c_clean = c.lower().replace("_", " ")
            if c_clean in q_lower or (c.lower() == "product" and "product" in q_lower) or (c.lower() == "region" and "region" in q_lower):
                best_dim = c
                logger.info(
                    "EntityResolver: Detected dimension '%s' by keyword match in query '%s'",
                    best_dim, query,
                )
                break

    # Detect additional requested metrics
    requested_metrics: List[str] = []
    if UNITS_KEYWORDS.search(query):
        for mc in metric_cols:
            if UNITS_KEYWORDS.search(mc):
                requested_metrics.append(mc)
                if not units_col:
                    units_col = mc
                break

    return {
        "dimension_col": best_dim,
        "target_entities": target_entities,
        "requested_metrics": requested_metrics,
        "units_col": units_col,
    }
