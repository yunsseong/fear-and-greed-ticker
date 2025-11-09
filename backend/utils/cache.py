"""
In-memory caching utility with TTL support
"""
import time
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SimpleCache:
    """Simple in-memory cache with TTL"""

    def __init__(self, default_ttl: int = 1800):
        """
        Initialize cache

        Args:
            default_ttl: Default time-to-live in seconds (default: 30 minutes)
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Set cache value with TTL

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (None uses default)
        """
        ttl = ttl or self.default_ttl
        expiry = time.time() + ttl

        self._cache[key] = {
            'value': value,
            'expiry': expiry,
            'created_at': datetime.utcnow()
        }

        logger.info(f"Cache set: key='{key}', ttl={ttl}s")

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if expired/missing
        """
        if key not in self._cache:
            self.misses += 1
            logger.debug(f"Cache miss: key='{key}'")
            return None

        entry = self._cache[key]

        # Check if expired
        if time.time() > entry['expiry']:
            del self._cache[key]
            self.misses += 1
            logger.info(f"Cache expired: key='{key}'")
            return None

        self.hits += 1
        logger.debug(f"Cache hit: key='{key}'")
        return entry['value']

    def invalidate(self, key: str) -> None:
        """
        Invalidate cache entry

        Args:
            key: Cache key to invalidate
        """
        if key in self._cache:
            del self._cache[key]
            logger.info(f"Cache invalidated: key='{key}'")

    def clear(self) -> None:
        """Clear all cache entries"""
        self._cache.clear()
        self.hits = 0
        self.misses = 0
        logger.info("Cache cleared")

    def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics

        Returns:
            Dictionary with cache stats
        """
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0

        return {
            'entries': len(self._cache),
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': round(hit_rate, 2)
        }


# Global cache instance
cache = SimpleCache(default_ttl=1800)  # 30 minutes default
