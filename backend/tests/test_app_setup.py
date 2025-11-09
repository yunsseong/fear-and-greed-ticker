"""
Tests for FastAPI application setup and configuration
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_app_initialization():
    """Test that FastAPI app initializes successfully"""
    assert app.title == "Fear & Greed Index API"
    assert app.version == "1.0.0"


def test_health_check_endpoint():
    """Test health check endpoint returns 200 and correct data"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Fear & Greed Index API"


def test_root_endpoint():
    """Test root endpoint returns API information"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "api_endpoint" in data


def test_cors_middleware():
    """Test CORS middleware is configured"""
    # CORS middleware is configured if middleware list includes CORSMiddleware
    middleware_classes = [m.cls.__name__ for m in app.user_middleware]
    assert "CORSMiddleware" in middleware_classes
