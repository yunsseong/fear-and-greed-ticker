/**
 * Renderer process script
 * Handles UI updates and user interactions
 */

let gauge = null;
let isLoading = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Renderer process loaded');

  // Initialize gauge
  gauge = new window.FearGreedGauge('gauge');

  // Load settings
  const settings = await window.api.getSettings();
  document.getElementById('launch-at-login').checked = settings.launchAtLogin;

  // Set index type radio button
  const indexType = settings.indexType || 'stock';
  document.getElementById(`index-${indexType}`).checked = true;

  // Setup event listeners
  setupEventListeners();

  // Load cached data if available
  loadCachedData();

  // Initial data fetch
  await fetchData();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    await fetchData();
  });

  // Quit button
  document.getElementById('quit-btn').addEventListener('click', () => {
    window.api.quitApp();
  });

  // Launch at login checkbox
  document.getElementById('launch-at-login').addEventListener('change', (e) => {
    window.api.setLaunchAtLogin(e.target.checked);
  });

  // Index type radio buttons
  document.getElementsByName('index-type').forEach((radio) => {
    radio.addEventListener('change', async (e) => {
      if (e.target.checked) {
        await window.api.setIndexType(e.target.value);
        // Data will be automatically fetched by main process
      }
    });
  });

  // CNN link
  document.getElementById('cnn-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.api.openExternalLink("https://edition.cnn.com/markets/fear-and-greed");
    console.log('Open CNN link');
  });
}

/**
 * Fetch data from backend API
 */
async function fetchData() {
  if (isLoading) return;

  try {
    isLoading = true;
    setLoadingState(true);

    const result = await window.api.fetchData();

    if (result.success && result.data) {
      updateUI(result.data);
      cacheData(result.data);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    showError('Unable to fetch data. Showing cached data if available.');
  } finally {
    isLoading = false;
    setLoadingState(false);
  }
}

/**
 * Update UI with new data
 * @param {Object} data - Fear & Greed data
 */
function updateUI(data) {
  if (!data || !data.current) {
    console.error('Invalid data received');
    return;
  }

  // Update current value
  const currentValue = data.current.value;
  const currentStatus = data.current.status;

  document.getElementById('current-value').textContent = currentValue;
  document.getElementById('current-status').textContent = currentStatus;

  // Apply color coding
  const statusClass = getStatusClass(currentStatus);
  document.getElementById('current-status').className = statusClass;

  // Update gauge
  if (gauge) {
    gauge.draw(currentValue, true);
  }

  // Update historical data
  if (data.historical) {
    updateHistoricalValue('prev-close', data.historical.previous_close);
    updateHistoricalValue('one-week', data.historical.one_week_ago);
    updateHistoricalValue('one-month', data.historical.one_month_ago);
    updateHistoricalValue('one-year', data.historical.one_year_ago);
  }

  // Update last updated timestamp
  if (data.current.timestamp) {
    const timestamp = new Date(data.current.timestamp);
    document.getElementById('last-updated').textContent =
      `Last Updated: ${formatTimestamp(timestamp)}`;
  }
}

/**
 * Update historical value display
 */
function updateHistoricalValue(elementId, data) {
  if (!data) return;

  const element = document.getElementById(elementId);
  const statusClass = getStatusClass(data.status);

  element.innerHTML = `<span class="${statusClass}">${data.value} (${data.status})</span>`;
}

/**
 * Get CSS class for status
 */
function getStatusClass(status) {
  const statusMap = {
    'Extreme Fear': 'extreme-fear',
    'Fear': 'fear',
    'Neutral': 'neutral',
    'Greed': 'greed',
    'Extreme Greed': 'extreme-greed'
  };

  return statusMap[status] || 'neutral';
}

/**
 * Format timestamp for display
 */
function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Get timezone abbreviation
  const tzString = date.toLocaleTimeString('en-us', {timeZoneName:'short'}).split(' ')[2];

  return `${year}-${month}-${day} ${hours}:${minutes} ${tzString}`;
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
  const refreshBtn = document.getElementById('refresh-btn');

  if (loading) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Loading...';
    refreshBtn.classList.add('loading');
  } else {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh';
    refreshBtn.classList.remove('loading');
  }
}

/**
 * Show error message
 */
function showError(message) {
  // Simple error display - could be enhanced with a banner
  console.error(message);
  document.getElementById('current-status').textContent = 'Error loading data';
}

/**
 * Cache data to localStorage
 */
function cacheData(data) {
  try {
    localStorage.setItem('lastFearGreedData', JSON.stringify(data));
    localStorage.setItem('lastFearGreedTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

/**
 * Load cached data
 */
function loadCachedData() {
  try {
    const cachedData = localStorage.getItem('lastFearGreedData');
    if (cachedData) {
      const data = JSON.parse(cachedData);
      updateUI(data);

      // Show cache indicator
      const timestamp = localStorage.getItem('lastFearGreedTimestamp');
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const hours = Math.floor(age / (1000 * 60 * 60));
        if (hours > 1) {
          document.getElementById('current-status').textContent += ' (Cached)';
        }
      }
    }
  } catch (error) {
    console.error('Error loading cached data:', error);
  }
}

// Listen for data updates from main process
window.api.onDataUpdated((data) => {
  updateUI(data);
  cacheData(data);
});

// Listen for errors
window.api.onError((error) => {
  console.error('Error received:', error);
  showError(error.message || 'An error occurred');
});
