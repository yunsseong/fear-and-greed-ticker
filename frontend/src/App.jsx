import { useState, useEffect, useRef } from 'react'
import { Gauge } from './components/Gauge'
import { Settings } from './components/Settings'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { RefreshCw, X, Settings as SettingsIcon } from 'lucide-react'
import { getTranslation } from './i18n/translations'

function App() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [indexType, setIndexType] = useState('stock')
  const [language, setLanguage] = useState('en')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const containerRef = useRef(null)

  useEffect(() => {
    // Check if Electron API is available
    if (!window.api) {
      console.error('Electron API not available. Please ensure preload script is loaded.')
      return
    }

    // Load initial settings
    const loadSettings = async () => {
      try {
        const settings = await window.api.getSettings()
        setLaunchAtLogin(settings.launchAtLogin)
        setIndexType(settings.indexType || 'stock')
        setLanguage(settings.language || 'en')
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    // Load cached data
    const loadCachedData = () => {
      try {
        const cachedData = localStorage.getItem('lastFearGreedData')
        if (cachedData) {
          setData(JSON.parse(cachedData))
        }
      } catch (error) {
        console.error('Error loading cached data:', error)
      }
    }

    loadSettings()
    loadCachedData()
    fetchData()

    // Listen for data updates
    const unsubscribeData = window.api.onDataUpdated((newData) => {
      setData(newData)
      cacheData(newData)
    })

    const unsubscribeError = window.api.onError((error) => {
      console.error('Error received:', error)
    })

    return () => {
      if (unsubscribeData) unsubscribeData()
      if (unsubscribeError) unsubscribeError()
    }
  }, [])

  // Adjust window height when content changes using ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !window.api) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        window.api.setWindowHeight(height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [currentPage])

  const fetchData = async () => {
    if (isLoading || !window.api) return

    try {
      setIsLoading(true)
      const result = await window.api.fetchData()

      if (result.success && result.data) {
        setData(result.data)
        cacheData(result.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cacheData = (data) => {
    try {
      localStorage.setItem('lastFearGreedData', JSON.stringify(data))
      localStorage.setItem('lastFearGreedTimestamp', Date.now().toString())
    } catch (error) {
      console.error('Error caching data:', error)
    }
  }

  const handleLaunchAtLoginChange = (checked) => {
    setLaunchAtLogin(checked)
    if (window.api) {
      window.api.setLaunchAtLogin(checked)
    }
  }

  const handleIndexTypeChange = async (value) => {
    setIndexType(value)
    if (window.api) {
      await window.api.setIndexType(value)
    }
  }

  const handleLanguageChange = async (value) => {
    setLanguage(value)
    if (window.api) {
      await window.api.setSetting('language', value)
    }
  }


  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const tzString = date.toLocaleTimeString('en-us', {timeZoneName:'short'}).split(' ')[2]
    return `${year}-${month}-${day} ${hours}:${minutes} ${tzString}`
  }

  const renderHistoricalValue = (data) => {
    if (!data) return '--'
    return `${data.value} (${data.status})`
  }

  const t = (key) => getTranslation(language, key)

  if (currentPage === 'settings') {
    return (
      <div ref={containerRef}>
        <Settings
          launchAtLogin={launchAtLogin}
          onLaunchAtLoginChange={handleLaunchAtLoginChange}
          indexType={indexType}
          onIndexTypeChange={handleIndexTypeChange}
          language={language}
          onLanguageChange={handleLanguageChange}
          onBack={() => setCurrentPage('dashboard')}
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-80 bg-background text-foreground">
      <div className="p-3 space-y-2">
        {/* Index Type Tabs */}
        <Tabs value={indexType} onValueChange={handleIndexTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="stock" className="text-xs">{t('stock')}</TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs">{t('crypto')}</TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Gauge Section */}
        <Card className="border-0">
          <CardContent className="p-3">
            {data?.current?.value ? (
              <Gauge
                value={data.current.value}
                status={data.current.status}
              />
            ) : (
              <div className="w-full text-center py-8 text-sm text-muted-foreground">
                {t('loading')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historical Data */}
        <Card className="border-0">
          <CardContent className="p-2">
            <div className="space-y-1">
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{t('previousClose')}</div>
                <div className="text-xs font-semibold">
                  {renderHistoricalValue(data?.historical?.previous_close)}
                </div>
              </div>
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{t('oneWeekAgo')}</div>
                <div className="text-xs font-semibold">
                  {renderHistoricalValue(data?.historical?.one_week_ago)}
                </div>
              </div>
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{t('oneMonthAgo')}</div>
                <div className="text-xs font-semibold">
                  {renderHistoricalValue(data?.historical?.one_month_ago)}
                </div>
              </div>
              <div className="p-2 bg-muted rounded-md flex justify-between items-center">
                <div className="text-xs text-muted-foreground">{t('oneYearAgo')}</div>
                <div className="text-xs font-semibold">
                  {renderHistoricalValue(data?.historical?.one_year_ago)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={fetchData}
            disabled={isLoading}
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={() => setCurrentPage('settings')}
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <SettingsIcon className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => window.api && window.api.quitApp()}
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
