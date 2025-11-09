"""
Pydantic models for Fear & Greed Index data
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class HistoricalValue(BaseModel):
    """Single historical data point"""
    value: int = Field(..., ge=0, le=100, description="Index value (0-100)")
    status: str = Field(..., description="Status label")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        valid_statuses = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class CurrentValue(BaseModel):
    """Current index value with timestamp"""
    value: int = Field(..., ge=0, le=100, description="Index value (0-100)")
    status: str = Field(..., description="Status label")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        valid_statuses = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed']
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v


class HistoricalData(BaseModel):
    """Collection of historical data points"""
    previous_close: HistoricalValue
    one_week_ago: HistoricalValue
    one_month_ago: HistoricalValue
    one_year_ago: HistoricalValue


class FearGreedResponse(BaseModel):
    """Complete API response model"""
    current: CurrentValue
    historical: HistoricalData
    source_url: str = "https://edition.cnn.com/markets/fear-and-greed"
    last_scraped: datetime = Field(default_factory=datetime.utcnow)
