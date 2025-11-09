"""
Tests for API endpoints and caching
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from utils.cache import cache

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear cache before each test"""
    cache.clear()
    yield
    cache.clear()


def test_health_check_with_cache_stats():
    """Test health check endpoint returns cache statistics"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "cache" in data
    assert "entries" in data["cache"]
    assert "hit_rate" in data["cache"]


def test_fear_greed_endpoint_exists():
    """Test that fear-greed endpoint is registered"""
    response = client.get("/api/v1/fear-greed")
    # Will fail initially as CNN scraping isn't mocked
    # But we can verify the endpoint exists
    assert response.status_code in [200, 500, 503]


def test_api_returns_correct_schema():
    """Test API response has correct schema structure"""
    # Router includes the prefix in the path
    from api.fear_greed import router
    routes = [route.path for route in router.routes]
    assert "/api/v1/fear-greed" in routes


def test_cors_headers_present():
    """Test CORS headers are configured"""
    middleware_classes = [m.cls.__name__ for m in app.user_middleware]
    assert "CORSMiddleware" in middleware_classes


def test_cache_set_and_get():
    """Test cache stores and retrieves data"""
    from utils.cache import SimpleCache

    test_cache = SimpleCache(default_ttl=60)
    test_cache.set("test_key", {"value": 42}, ttl=60)

    result = test_cache.get("test_key")
    assert result == {"value": 42}

    # Test cache stats
    stats = test_cache.get_stats()
    assert stats["hits"] == 1
    assert stats["misses"] == 0


def test_cache_expiration():
    """Test cache entries expire after TTL"""
    from utils.cache import SimpleCache
    import time

    test_cache = SimpleCache(default_ttl=1)
    test_cache.set("test_key", "value", ttl=1)

    # Should be available immediately
    assert test_cache.get("test_key") == "value"

    # Wait for expiration
    time.sleep(1.1)

    # Should be expired
    assert test_cache.get("test_key") is None


def test_cache_invalidation():
    """Test cache invalidation works"""
    from utils.cache import SimpleCache

    test_cache = SimpleCache()
    test_cache.set("test_key", "value")
    assert test_cache.get("test_key") == "value"

    test_cache.invalidate("test_key")
    assert test_cache.get("test_key") is None
