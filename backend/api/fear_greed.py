"""
Fear & Greed Index API endpoints
"""
from fastapi import APIRouter, HTTPException, status
from models.fear_greed import FearGreedResponse
from scrapers.cnn_scraper import scrape_fear_greed_index
from scrapers.crypto_scraper import scrape_crypto_fear_greed_index
from utils.cache import cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["fear-greed"])

CACHE_KEY_CNN = "fear_greed_data_cnn"
CACHE_KEY_CRYPTO = "fear_greed_data_crypto"


@router.get("/fear-greed", response_model=FearGreedResponse)
async def get_fear_greed_index():
    """
    Get current and historical Fear & Greed Index data (CNN - US Stock Market)

    Returns:
        FearGreedResponse with current and historical data

    Raises:
        HTTPException: If scraping fails
    """
    return await get_index_data(CACHE_KEY_CNN, scrape_fear_greed_index, "CNN Fear & Greed")


@router.get("/fear-greed/stock", response_model=FearGreedResponse)
async def get_stock_fear_greed_index():
    """
    Get current and historical Fear & Greed Index data for US Stock Market (CNN)

    Returns:
        FearGreedResponse with current and historical data
    """
    return await get_index_data(CACHE_KEY_CNN, scrape_fear_greed_index, "Stock Market")


@router.get("/fear-greed/crypto", response_model=FearGreedResponse)
async def get_crypto_fear_greed_index():
    """
    Get current and historical Fear & Greed Index data for Cryptocurrency (Alternative.me)

    Returns:
        FearGreedResponse with current and historical data
    """
    return await get_index_data(CACHE_KEY_CRYPTO, scrape_crypto_fear_greed_index, "Crypto")


async def get_index_data(cache_key: str, scraper_func, index_name: str):
    """
    Generic function to fetch index data with caching

    Args:
        cache_key: Cache key for this index
        scraper_func: Async function to scrape data
        index_name: Name of the index for logging

    Returns:
        FearGreedResponse with current and historical data

    Raises:
        HTTPException: If scraping fails
    """
    try:
        # Check cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info(f"Returning cached {index_name} data")
            return cached_data

        # Cache miss - scrape fresh data
        logger.info(f"Cache miss - scraping fresh {index_name} data")
        data = await scraper_func()

        # Validate with Pydantic model
        response = FearGreedResponse(**data)

        # Cache the response (use model_dump for Pydantic v2)
        cache.set(cache_key, response.model_dump(), ttl=1800)  # 30 minutes

        return response

    except ValueError as e:
        logger.error(f"Data validation error for {index_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse {index_name} Index data"
        )
    except Exception as e:
        logger.error(f"Error fetching {index_name} Index: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to fetch {index_name} Index data"
        )
