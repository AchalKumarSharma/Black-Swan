"""Currency and metric formatting helpers for executive FP&A presentation."""

from typing import Union


def format_currency_human(val: Union[int, float], curr_symbol: str = "$") -> str:
    """Format numeric values into crisp, executive financial strings (Lakhs/Crores for INR)."""
    try:
        num = float(val)
    except (ValueError, TypeError):
        return f"{curr_symbol}0"

    sign = "-" if num < 0 else ""
    abs_num = abs(num)

    # Indian Rupee formatting (Lakhs and Crores)
    if curr_symbol in ("₹", "Rs", "INR") or "₹" in curr_symbol:
        sym = "₹"
        if abs_num >= 10_000_000:
            cr = abs_num / 10_000_000
            formatted = f"{cr:.2f}".rstrip("0").rstrip(".") if cr != int(cr) else f"{int(cr)}"
            return f"{sign}{sym}{formatted}Cr"
        elif abs_num >= 100_000:
            lakh = abs_num / 100_000
            formatted = f"{lakh:.2f}".rstrip("0").rstrip(".") if lakh != int(lakh) else f"{int(lakh)}"
            return f"{sign}{sym}{formatted}L"
        else:
            return f"{sign}{sym}{abs_num:,.0f}"
    else:
        # Standard international formatting (k, M, B)
        sym = curr_symbol or "$"
        if abs_num >= 1_000_000_000:
            b = abs_num / 1_000_000_000
            formatted = f"{b:.2f}".rstrip("0").rstrip(".") if b != int(b) else f"{int(b)}"
            return f"{sign}{sym}{formatted}B"
        elif abs_num >= 1_000_000:
            m = abs_num / 1_000_000
            formatted = f"{m:.2f}".rstrip("0").rstrip(".") if m != int(m) else f"{int(m)}"
            return f"{sign}{sym}{formatted}M"
        elif abs_num >= 1_000:
            k = abs_num / 1_000
            formatted = f"{k:.1f}".rstrip("0").rstrip(".") if k != int(k) else f"{int(k)}"
            return f"{sign}{sym}{formatted}k"
        else:
            return f"{sign}{sym}{abs_num:,.0f}"


def format_bps_human(bps: int) -> str:
    """Format basis points into clean plain-English text without raw variable names."""
    abs_bps = abs(bps)
    pct = abs_bps / 100.0
    if bps < 0:
        return f"{abs_bps:,} basis points ({pct:.2f} percentage points) contraction"
    elif bps > 0:
        return f"{abs_bps:,} basis points ({pct:.2f} percentage points) expansion"
    return "0 basis points"
