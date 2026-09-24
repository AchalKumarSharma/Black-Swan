"""Multi-provider LiteLLM Router for Black Swan FP&A Agents.

Provides automatic model failover across Google Gemini and Groq tiers:
- Tier 1: gemini/gemini-2.0-flash
- Tier 2: gemini/gemini-1.5-flash / gemini/gemini-3.6-flash
- Tier 3: groq/llama-3.3-70b-versatile / groq/qwen/qwen3.8-27b / groq/openai/gpt-oss-120b

Guarantees quota resilience, prevents 404 model errors, and recovers gracefully from 429 rate limits.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional
from litellm import Router
from app.config import get_settings

logger = logging.getLogger("blackswan.core.llm_router")

_router_instance: Optional[Router] = None


def get_llm_router() -> Router:
    """Initialize and return the singleton LiteLLM Router instance."""
    global _router_instance
    if _router_instance is not None:
        return _router_instance

    settings = get_settings()
    gemini_key = settings.GEMINI_API_KEY
    groq_key = settings.GROQ_API_KEY

    model_list: List[Dict[str, Any]] = []

    if gemini_key and gemini_key != "your_gemini_api_key_here":
        model_list.extend([
            {
                "model_name": "gemini/gemini-2.0-flash",
                "litellm_params": {
                    "model": "gemini/gemini-2.0-flash",
                    "api_key": gemini_key,
                },
            },
            {
                "model_name": "gemini/gemini-1.5-flash",
                "litellm_params": {
                    "model": "gemini/gemini-1.5-flash",
                    "api_key": gemini_key,
                },
            },
            {
                "model_name": "gemini/gemini-3.6-flash",
                "litellm_params": {
                    "model": "gemini/gemini-3.6-flash",
                    "api_key": gemini_key,
                },
            },
        ])

    if groq_key:
        model_list.extend([
            {
                "model_name": "groq/llama-3.3-70b-versatile",
                "litellm_params": {
                    "model": "groq/llama-3.3-70b-versatile",
                    "api_key": groq_key,
                },
            },
            {
                "model_name": "groq/qwen/qwen3.8-27b",
                "litellm_params": {
                    "model": "groq/qwen/qwen3.8-27b",
                    "api_key": groq_key,
                },
            },
            {
                "model_name": "groq/openai/gpt-oss-120b",
                "litellm_params": {
                    "model": "groq/openai/gpt-oss-120b",
                    "api_key": groq_key,
                },
            },
        ])

    # Fallback chain configurations
    tier3_fallbacks = ["groq/qwen/qwen3.8-27b", "groq/openai/gpt-oss-120b"] if groq_key else []
    groq_llama_fallbacks = ["groq/qwen/qwen3.8-27b", "groq/openai/gpt-oss-120b"] if groq_key else []

    gemini_fallbacks = [
        "gemini/gemini-1.5-flash",
        "gemini/gemini-3.6-flash",
    ]
    if groq_key:
        gemini_fallbacks.extend(["groq/llama-3.3-70b-versatile", *tier3_fallbacks])

    fallbacks: List[Dict[str, List[str]]] = [
        {"gemini/gemini-2.0-flash": gemini_fallbacks},
        {
            "gemini/gemini-1.5-flash": [
                m for m in ["gemini/gemini-3.6-flash", "groq/llama-3.3-70b-versatile", *tier3_fallbacks]
                if m != "gemini/gemini-1.5-flash"
            ]
        },
        {
            "gemini/gemini-3.6-flash": [
                m for m in ["groq/llama-3.3-70b-versatile", *tier3_fallbacks]
            ]
        },
    ]

    if groq_key:
        fallbacks.append({
            "groq/llama-3.3-70b-versatile": groq_llama_fallbacks
        })

    _router_instance = Router(
        model_list=model_list,
        fallbacks=fallbacks,
        cooldown_time=60,
        num_retries=2,
    )
    logger.info("LiteLLM Router initialized with %d model deployments.", len(model_list))
    return _router_instance


def extract_json_payload(text: str) -> Dict[str, Any]:
    """Extract and parse JSON payload from LLM response text, stripping markdown if present."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    cleaned = cleaned.strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Search for first JSON object {...}
        match = re.search(r"(\{[\s\S]*\})", cleaned)
        if match:
            return json.loads(match.group(1))
        raise


async def route_completion(
    messages: Optional[List[Dict[str, str]]] = None,
    prompt: Optional[str] = None,
    response_format: Optional[Any] = None,
    temperature: float = 0.2,
    model: Optional[str] = None,
    **kwargs,
) -> str:
    """Route completion through multi-provider LiteLLM Router with automatic fallbacks.

    Args:
        messages: List of chat messages (dicts with 'role' and 'content').
        prompt: Single text prompt string (converted to user message if messages is None).
        response_format: Optional response format (e.g. {"type": "json_object"}).
        temperature: Sampling temperature (default 0.2).
        model: Target model name (default "gemini/gemini-2.0-flash").
        **kwargs: Additional parameters passed to router.acompletion.

    Returns:
        The generated text content string.
    """
    settings = get_settings()
    if not settings.GEMINI_API_KEY and not settings.GROQ_API_KEY:
        raise RuntimeError("Neither GEMINI_API_KEY nor GROQ_API_KEY is configured.")

    if messages is None:
        if prompt is None:
            raise ValueError("Either 'messages' or 'prompt' must be provided to route_completion.")
        messages = [{"role": "user", "content": prompt}]

    target_model = model or "gemini/gemini-2.0-flash"
    router = get_llm_router()

    call_kwargs: Dict[str, Any] = {
        "model": target_model,
        "messages": messages,
        "temperature": temperature,
        **kwargs,
    }
    if response_format is not None:
        call_kwargs["response_format"] = response_format

    try:
        response = await router.acompletion(**call_kwargs)
        used_model = getattr(response, "model", target_model)
        content = ""
        if response.choices and len(response.choices) > 0:
            msg = response.choices[0].message
            content = msg.content or ""
        logger.info("LiteLLM Router successfully completed query via model '%s'", used_model)
        return content.strip()
    except Exception as e:
        logger.warning("LiteLLM Router call failed on model '%s': %s", target_model, e)
        raise
