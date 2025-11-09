"""
Crypto Fear & Greed Index Scraper
Fetches Fear & Greed Index data from Alternative.me API
"""
import httpx
import logging
from typing import Dict
from datetime import datetime

logger = logging.getLogger(__name__)

# Alternative.me Crypto Fear & Greed Index API
CRYPTO_API_URL = "https://api.alternative.me/fng/"
CRYPTO_PAGE_URL = "https://alternative.me/crypto/fear-and-greed-index/"
TIMEOUT = 15.0


def get_status_from_value(value: int) -> str:
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


async def scrape_crypto_fear_greed_index() -> Dict:
    """
    Fetch Crypto Fear & Greed Index data from Alternative.me API

    Returns:
        Dictionary with current and historical data

    Raises:
        Exception: If API request fails
    """
    try:
        logger.info(f"Fetching Crypto Fear & Greed Index from Alternative.me API: {CRYPTO_API_URL}")

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            # Fetch current + last 30 days for historical data
            response = await client.get(f"{CRYPTO_API_URL}?limit=365")
            response.raise_for_status()
            api_data = response.json()

        # Extract data array
        data_array = api_data.get("data", [])

        if not data_array:
            raise ValueError("No data in API response")

        # Current data is first element
        current = data_array[0]
        current_value = int(current.get("value", 0))
        current_status = current.get("value_classification", "")

        # Find historical data points (approximate days)
        historical_data = {
            "previous_close": get_historical_value(data_array, 1),
            "one_week_ago": get_historical_value(data_array, 7),
            "one_month_ago": get_historical_value(data_array, 30),
            "one_year_ago": get_historical_value(data_array, 365)
        }

        data = {
            "current": {
                "value": current_value,
                "status": current_status or get_status_from_value(current_value),
                "timestamp": datetime.fromtimestamp(int(current.get("timestamp", 0))).isoformat() + "Z"
            },
            "historical": {
                "previous_close": {
                    "value": historical_data["previous_close"],
                    "status": get_status_from_value(historical_data["previous_close"])
                },
                "one_week_ago": {
                    "value": historical_data["one_week_ago"],
                    "status": get_status_from_value(historical_data["one_week_ago"])
                },
                "one_month_ago": {
                    "value": historical_data["one_month_ago"],
                    "status": get_status_from_value(historical_data["one_month_ago"])
                },
                "one_year_ago": {
                    "value": historical_data["one_year_ago"],
                    "status": get_status_from_value(historical_data["one_year_ago"])
                }
            },
            "source_url": CRYPTO_PAGE_URL,
            "last_scraped": datetime.utcnow().isoformat() + "Z"
        }

        logger.info(f"Successfully fetched crypto data from API: current value = {current_value} ({current_status})")
        return data

    except httpx.HTTPError as e:
        logger.error(f"HTTP error while fetching from Alternative.me API: {e}")
        raise
    except (KeyError, ValueError) as e:
        logger.error(f"Error parsing Alternative.me API response: {e}")
        raise
    except Exception as e:
        logger.error(f"Error fetching Crypto Fear & Greed Index: {e}")
        raise


def get_historical_value(data_array: list, days_ago: int) -> int:
    """
    Get historical value from data array

    Args:
        data_array: Array of historical data points
        days_ago: Number of days ago to fetch

    Returns:
        Historical value (0-100)
    """
    try:
        # Data is sorted by date descending, so index corresponds to days ago
        if days_ago < len(data_array):
            return int(data_array[days_ago].get("value", 50))
        else:
            # If not enough historical data, return neutral
            return 50
    except (IndexError, ValueError, TypeError):
        return 50
