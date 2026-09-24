"""Shared in-memory DuckDB singleton connection and table manager."""

import threading
from typing import List, Optional
import duckdb
import polars as pl

_con: Optional[duckdb.DuckDBPyConnection] = None
_lock = threading.Lock()


def get_duckdb() -> duckdb.DuckDBPyConnection:
    """Return shared in-memory DuckDB connection singleton."""
    global _con
    if _con is None:
        with _lock:
            if _con is None:
                _con = duckdb.connect(database=":memory:")
    return _con


def sanitize_table_name(dataset_id: str) -> str:
    """Convert dataset UUID to valid SQL identifier data_{uuid_with_underscores}."""
    clean_id = dataset_id.replace("-", "_").strip()
    return f"data_{clean_id}"


def register_dataset(dataset_id: str, df: pl.DataFrame) -> str:
    """Register a Polars DataFrame into DuckDB as an in-memory table.

    Returns the registered table name.
    """
    con = get_duckdb()
    table_name = sanitize_table_name(dataset_id)
    with _lock:
        con.execute(f"CREATE OR REPLACE TABLE {table_name} AS SELECT * FROM df")
    return table_name


def query_dataset(dataset_id: str, query: str) -> pl.DataFrame:
    """Execute a SQL query against the DuckDB singleton and return a Polars DataFrame."""
    con = get_duckdb()
    table_name = sanitize_table_name(dataset_id)
    # If the query uses a generic placeholder {table}, interpolate it safely
    formatted_query = query.replace("{table}", table_name)
    with _lock:
        return con.execute(formatted_query).pl()


def table_exists(dataset_id: str) -> bool:
    """Check if the table for a dataset_id exists in DuckDB."""
    con = get_duckdb()
    table_name = sanitize_table_name(dataset_id)
    with _lock:
        res = con.execute(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
            [table_name],
        ).fetchone()
        return bool(res and res[0] > 0)


def list_tables() -> List[str]:
    """List all registered tables in DuckDB."""
    con = get_duckdb()
    with _lock:
        rows = con.execute("SHOW TABLES").fetchall()
        return [r[0] for r in rows]
