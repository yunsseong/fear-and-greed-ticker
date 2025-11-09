/**
 * API Client for fetching Fear & Greed Index data
 * Handles communication with FastAPI backend
 */

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const TIMEOUT = 10000; // 10 seconds

/**
 * Validate Fear & Greed data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validated data
 * @throws {Error} If data is invalid
 */
function validateFearGreedData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: not an object');
  }

  if (!data.current || typeof data.current !== 'object') {
    throw new Error('Invalid response: missing current data');
  }

  if (typeof data.current.value !== 'number') {
    throw new Error('Invalid response: current.value must be a number');
  }

  if (data.current.value < 0 || data.current.value > 100) {
    throw new Error(`Invalid response: value out of range (${data.current.value})`);
  }

  if (typeof data.current.status !== 'string') {
    throw new Error('Invalid response: current.status must be a string');
  }

  return data;
}

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
    return validateFearGreedData(data);
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
