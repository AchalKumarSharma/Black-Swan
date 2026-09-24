"""Dynamic schema inference and data coercion engine for Black Swan financial ingestion."""

import re
from typing import Any, Dict, List, Optional, Tuple
import polars as pl

# Regex patterns for period/date matching
PERIOD_PATTERNS = [
    re.compile(r"^Q[1-4][-_\s/]?\d{2,4}$", re.IGNORECASE),
    re.compile(r"^\d{4}[-_\s/]?Q[1-4]$", re.IGNORECASE),
    re.compile(r"^\d{4}[-/.]\d{1,2}([-/.]\d{1,2})?$"),
    re.compile(r"^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$"),
    re.compile(r"^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-_\s/]?\d{2,4}$", re.IGNORECASE),
    re.compile(r"^\d{2,4}[-_\s/]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*$", re.IGNORECASE),
]

PERIOD_KEYWORDS = {"date", "period", "quarter", "month", "year", "time", "fiscal_period", "qtr", "dt"}

DIMENSION_KEYWORDS = {
    "region", "territory", "division", "segment", "department", "business_unit",
    "entity", "product", "product_line", "category", "market", "geography",
    "country", "state", "city", "customer", "account", "tier", "channel"
}

REVENUE_KEYWORDS = {
    "revenue", "rev", "sales", "turnover", "top_line", "arr", "mrr", "billings",
    "gross_revenue", "net_revenue", "total_revenue"
}

COGS_KEYWORDS = {
    "cogs", "cost_of_goods_sold", "cost_of_sales", "cost", "costs", "expense",
    "expenses", "opex", "spend", "direct_cost", "cost_of_revenue"
}


# Regex pattern for ID / Reference columns
ID_REGEX = re.compile(
    r"(?:^|[_\W])(id|invoice|uuid|code|ref|identifier|pk|key|num|number)(?:[_\W]|$)|^(id|uuid|code|ref)$",
    re.IGNORECASE,
)


def clean_financial_value(val: Any) -> Optional[float]:
    """Parse accounting strings like '(1,250.00)' -> -1250.00, '$1,250.00' -> 1250.00."""
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip()
    if not s or s.lower() in ("nan", "null", "none", "-"):
        return None
    is_negative = False
    if s.startswith("(") and s.endswith(")"):
        is_negative = True
        s = s[1:-1].strip()
    elif s.startswith("-"):
        is_negative = True
        s = s[1:].strip()

    s = s.replace("$", "").replace("€", "").replace("£", "").replace("₹", "").replace(",", "").replace("%", "").strip()
    try:
        f = float(s)
        return -f if is_negative else f
    except ValueError:
        return None


def coerce_dataframe_types(df: pl.DataFrame) -> pl.DataFrame:
    """Detect string columns with accounting or financial numbers and coerce to Float64."""
    new_cols = []
    for col in df.columns:
        series = df[col]
        if series.dtype in (pl.String, pl.Categorical):
            non_null = [v for v in series.to_list() if v is not None and str(v).strip() != ""]
            if non_null:
                parsed = [clean_financial_value(v) for v in non_null[:100]]
                valid_count = sum(1 for p in parsed if p is not None)
                # If over 75% of non-null samples parse as numbers, coerce column
                if valid_count / len(parsed) >= 0.75:
                    cleaned_series = pl.Series(
                        col,
                        [clean_financial_value(v) for v in series.to_list()],
                        dtype=pl.Float64,
                    )
                    new_cols.append(cleaned_series)
                    continue
        new_cols.append(series)
    return pl.DataFrame(new_cols)


def is_period_series(series: pl.Series) -> bool:
    """Check if series represents a date/period column."""
    if series.dtype in (pl.Date, pl.Datetime, pl.Time):
        return True
    samples = [str(v).strip() for v in series.drop_nulls().head(30).to_list()]
    if not samples:
        return False
    matched = sum(1 for s in samples if any(p.match(s) for p in PERIOD_PATTERNS))
    return (matched / len(samples)) >= 0.6


def detect_column_role(col_name: str, series: pl.Series) -> Tuple[str, float]:
    """Detect role of column ('period', 'dimension', 'revenue', 'cogs', 'other') and confidence."""
    norm_name = col_name.strip().lower().replace(" ", "_").replace("-", "_")

    # Check ID / Reference columns first -> strictly assign to 'other'
    if ID_REGEX.search(norm_name) or ID_REGEX.search(col_name):
        return "other", 0.90

    # Check Period
    if is_period_series(series) or any(k in norm_name for k in PERIOD_KEYWORDS):
        conf = 0.95 if any(k in norm_name for k in PERIOD_KEYWORDS) else 0.85
        return "period", conf

    is_numeric = series.dtype.is_numeric()

    # Check Numeric Roles (Revenue, COGS, other metrics)
    if is_numeric:
        if any(norm_name == k or norm_name.startswith(f"{k}_") or norm_name.endswith(f"_{k}") for k in REVENUE_KEYWORDS):
            return "revenue", 0.95
        if any(k in norm_name for k in REVENUE_KEYWORDS):
            return "revenue", 0.85

        if any(norm_name == k or norm_name.startswith(f"{k}_") or norm_name.endswith(f"_{k}") for k in COGS_KEYWORDS):
            return "cogs", 0.95
        if any(k in norm_name for k in COGS_KEYWORDS):
            return "cogs", 0.85

        return "other", 0.6

    # Check Dimension / Category
    if series.dtype in (pl.String, pl.Categorical):
        n_unique = series.n_unique()
        total_rows = max(len(series), 1)
        if any(k in norm_name for k in DIMENSION_KEYWORDS):
            return "dimension", 0.95
        # Low cardinality categorical column (only if non-ID)
        if not ID_REGEX.search(norm_name) and not ID_REGEX.search(col_name):
            if total_rows > 10 and (n_unique <= 100 or (n_unique / total_rows) <= 0.35):
                return "dimension", 0.70

    return "other", 0.5


def infer_schema(df: pl.DataFrame) -> Dict[str, Any]:
    """Analyze DataFrame columns, identify roles, and determine if mapping confirmation is needed.

    Returns a structured dictionary with column metadata, inferred roles, and status ('ingested' | 'needs_mapping').
    Raises ValueError if required financial axes are missing.
    """
    cleaned_df = coerce_dataframe_types(df)
    columns_info: List[Dict[str, Any]] = []
    candidate_roles: Dict[str, List[str]] = {
        "period": [],
        "dimension": [],
        "revenue": [],
        "cogs": [],
        "other": [],
    }

    for col in cleaned_df.columns:
        series = cleaned_df[col]
        role, confidence = detect_column_role(col, series)
        candidate_roles[role].append(col)

        sample_vals = [
            str(v) if v is not None else None
            for v in series.drop_nulls().head(4).to_list()
        ]

        columns_info.append({
            "name": col,
            "dtype": str(series.dtype),
            "detected_role": role,
            "confidence": round(confidence, 2),
            "sample_values": sample_vals,
        })

    # Validate essential financial axes
    validation_issues = []
    numeric_cols = [c for c in cleaned_df.columns if cleaned_df[c].dtype.is_numeric()]
    if not numeric_cols:
        validation_issues.append({
            "field": "revenue",
            "issue": "Missing required financial metrics: dataset contains zero numeric or currency columns.",
        })

    if not candidate_roles["period"] and not candidate_roles["dimension"]:
        validation_issues.append({
            "field": "dimension",
            "issue": "Missing required analysis axis: no date/period or categorical dimension found.",
        })

    if validation_issues:
        return {
            "is_valid": False,
            "issues": validation_issues,
            "columns": columns_info,
            "cleaned_df": cleaned_df,
        }

    # Evaluate Ambiguity
    is_ambiguous = False
    # If multiple revenue candidates without a dominant name
    if len(candidate_roles["revenue"]) > 1:
        is_ambiguous = True
    # If multiple date/period columns
    if len(candidate_roles["period"]) > 1:
        is_ambiguous = True
    # If no explicit revenue column but generic numeric columns exist
    if not candidate_roles["revenue"] and numeric_cols:
        is_ambiguous = True

    status = "needs_mapping" if is_ambiguous else "ingested"

    period_col = candidate_roles["period"][0] if candidate_roles["period"] else None

    # Priority dimension selection: strictly exclude ID columns and prioritize Region > Product
    valid_dims = [c for c in candidate_roles["dimension"] if not ID_REGEX.search(c)]
    REGION_KEYWORDS = {"region", "territory", "division", "market", "geography"}
    PRODUCT_KEYWORDS = {"product", "product_line", "category", "segment"}

    dimension_col = None
    for cand in valid_dims:
        c_norm = cand.strip().lower().replace(" ", "_").replace("-", "_")
        if any(k in c_norm for k in REGION_KEYWORDS):
            dimension_col = cand
            break

    if not dimension_col:
        for cand in valid_dims:
            c_norm = cand.strip().lower().replace(" ", "_").replace("-", "_")
            if any(k in c_norm for k in PRODUCT_KEYWORDS):
                dimension_col = cand
                break

    if not dimension_col:
        if valid_dims:
            dimension_col = valid_dims[0]
        elif candidate_roles["dimension"]:
            dimension_col = candidate_roles["dimension"][0]

    revenue_col = candidate_roles["revenue"][0] if candidate_roles["revenue"] else None

    # Priority COGS selection: direct costs over operating expenses
    cogs_col = None
    DIRECT_COGS_KEYWORDS = {"cogs", "cost_of_goods_sold", "cost_of_sales", "direct_cost"}
    for cand in candidate_roles["cogs"]:
        c_norm = cand.strip().lower().replace(" ", "_").replace("-", "_")
        if any(k in c_norm for k in DIRECT_COGS_KEYWORDS):
            cogs_col = cand
            break
    if not cogs_col and candidate_roles["cogs"]:
        cogs_col = candidate_roles["cogs"][0]

    return {
        "is_valid": True,
        "status": status,
        "period_col": period_col,
        "dimension_col": dimension_col,
        "revenue_col": revenue_col,
        "cogs_col": cogs_col,
        "columns": columns_info,
        "candidate_roles": candidate_roles,
        "cleaned_df": cleaned_df,
    }
