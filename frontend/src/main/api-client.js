/**
 * API Client for fetching Fear & Greed Index data
 * Handles communication with FastAPI backend
 */

const BACKEND_URL = 'http://127.0.0.1:8000';
const TIMEOUT = 10000; // 10 seconds

/**
 * Fetch Fear & Greed Index data from backend
 * @param {string} indexType - Type of index: 'stock' or 'crypto' (default: 'stock')
 * @returns {Promise<Object>} Fear & Greed data
 */
async function fetchFearGreedData(indexType = 'stock') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const endpoint = indexType === 'crypto'
    ? `${BACKEND_URL}/api/v1/fear-greed/crypto`
    : `${BACKEND_URL}/api/v1/fear-greed/stock`;

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    throw error;
  }
}

/**
 * Fetch data with retry logic
 * @param {number} maxRetries - Maximum retry attempts
 * @param {string} indexType - Type of index: 'stock' or 'crypto'
 * @returns {Promise<Object>} Fear & Greed data
 */
async function fetchWithRetry(maxRetries = 3, indexType = 'stock') {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fetchFearGreedData(indexType);
      return data;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

module.exports = {
  fetchFearGreedData,
  fetchWithRetry,
};
