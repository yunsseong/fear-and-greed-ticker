"""
CNN Fear & Greed Index Scraper
Fetches Fear & Greed Index data from CNN DataViz API
"""
import httpx
import logging
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)

# CNN's official DataViz API endpoint
CNN_API_URL = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata"
CNN_PAGE_URL = "https://edition.cnn.com/markets/fear-and-greed"
TIMEOUT = 15.0


def normalize_rating(rating: str) -> str:
    """
    Normalize rating string to title case

    Args:
        rating: Rating string from API (e.g., "extreme fear")

    Returns:
        Normalized rating (e.g., "Extreme Fear")
    """
    return rating.title()


def get_status_from_value(value: float) -> str:
    """
    Map index value to status label

    Args:
        value: Index value (0-100)

    Returns:
        Status label string
    """
    if value <= 25:
        return "Extreme Fear"
    elif value <= 45:
        return "Fear"
    elif value <= 55:
        return "Neutral"
    elif value <= 75:
        return "Greed"
    else:
        return "Extreme Greed"


async def scrape_fear_greed_index() -> Dict:
    """
    Fetch Fear & Greed Index data from CNN DataViz API

    Returns:
        Dictionary with current and historical data

    Raises:
        Exception: If API request fails
    """
    try:
        logger.info(f"Fetching Fear & Greed Index from CNN API: {CNN_API_URL}")

        # Required headers to avoid bot detection
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': CNN_PAGE_URL,
            'Accept': 'application/json'
        }

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(CNN_API_URL, headers=headers)
            response.raise_for_status()
            api_data = response.json()

        # Extract fear_and_greed data
        fg_data = api_data.get("fear_and_greed", {})

        if not fg_data:
            raise ValueError("No fear_and_greed data in API response")

        # Extract current value
        current_score = fg_data.get("score", 0)
        current_rating = fg_data.get("rating", "")
        timestamp = fg_data.get("timestamp", datetime.utcnow().isoformat() + "Z")

        # Round score to integer for consistency
        current_value = round(current_score)

        # Extract historical values
        previous_close = round(fg_data.get("previous_close", 50))
        one_week_ago = round(fg_data.get("previous_1_week", 50))
        one_month_ago = round(fg_data.get("previous_1_month", 50))
        one_year_ago = round(fg_data.get("previous_1_year", 50))

        data = {
            "current": {
                "value": current_value,
                "status": normalize_rating(current_rating) or get_status_from_value(current_value),
                "timestamp": timestamp
            },
            "historical": {
                "previous_close": {
                    "value": previous_close,
                    "status": get_status_from_value(previous_close)
                },
                "one_week_ago": {
                    "value": one_week_ago,
                    "status": get_status_from_value(one_week_ago)
                },
                "one_month_ago": {
                    "value": one_month_ago,
                    "status": get_status_from_value(one_month_ago)
                },
                "one_year_ago": {
                    "value": one_year_ago,
                    "status": get_status_from_value(one_year_ago)
                }
            },
            "source_url": CNN_PAGE_URL,
            "last_scraped": datetime.utcnow().isoformat() + "Z"
        }

        logger.info(f"Successfully fetched data from API: current value = {current_value} ({normalize_rating(current_rating)})")
        return data

    except httpx.HTTPError as e:
        logger.error(f"HTTP error while fetching from CNN API: {e}")
        raise
    except (KeyError, ValueError) as e:
        logger.error(f"Error parsing CNN API response: {e}")
        raise
    except Exception as e:
        logger.error(f"Error fetching Fear & Greed Index: {e}")
        raise
