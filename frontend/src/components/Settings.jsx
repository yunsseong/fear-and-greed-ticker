import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { ArrowLeft, Download } from 'lucide-react'
import { getTranslation } from '../i18n/translations'

export function Settings({
  launchAtLogin,
  onLaunchAtLoginChange,
  indexType,
  onIndexTypeChange,
  language,
  onLanguageChange,
  onBack
}) {
  const t = (key) => getTranslation(language, key)
  const [updateStatus, setUpdateStatus] = useState('idle')
  const [updateInfo, setUpdateInfo] = useState(null)

  const handleCheckForUpdates = async () => {
    if (!window.api) return

    setUpdateStatus('checking')
    const result = await window.api.checkForUpdates()

    if (result.success && result.updateInfo) {
      setUpdateInfo(result.updateInfo)
      setUpdateStatus('available')
    } else {
      setUpdateStatus('upToDate')
      setTimeout(() => setUpdateStatus('idle'), 2000)
    }
  }

  const handleDownloadUpdate = async () => {
    if (!window.api) return

    setUpdateStatus('downloading')
    await window.api.downloadUpdate()
  }

  const handleInstallUpdate = () => {
    if (!window.api) return
    window.api.installUpdate()
  }

  return (
    <div className="w-80 bg-background text-foreground">
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{t('settings')}</h1>
          <Button
            onClick={onBack}
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Launch at Login */}
        <Card className="border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="launch" className="text-sm font-medium cursor-pointer">
                {t('launchAtLogin')}
              </Label>
              <Checkbox
                id="launch"
                checked={launchAtLogin}
                onCheckedChange={onLaunchAtLoginChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Index Type Selection */}
        <Card className="border-0">
          <CardContent className="p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('defaultIndexType')}</Label>
              <Tabs value={indexType} onValueChange={onIndexTypeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="stock" className="text-xs">{t('stockMarket')}</TabsTrigger>
                  <TabsTrigger value="crypto" className="text-xs">{t('cryptocurrency')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card className="border-0">
          <CardContent className="p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('language')}</Label>
              <Tabs value={language} onValueChange={onLanguageChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="en" className="text-xs">{t('english')}</TabsTrigger>
                  <TabsTrigger value="ko" className="text-xs">{t('korean')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Update Section */}
        <Card className="border-0">
          <CardContent className="p-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('updates')}</Label>
              {updateStatus === 'idle' && (
                <Button
                  onClick={handleCheckForUpdates}
                  variant="outline"
                  className="w-full h-8 text-xs"
                >
                  {t('checkForUpdates')}
                </Button>
              )}
              {updateStatus === 'checking' && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  {t('checking')}
                </div>
              )}
              {updateStatus === 'upToDate' && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  {t('upToDate')}
                </div>
              )}
              {updateStatus === 'available' && (
                <Button
                  onClick={handleDownloadUpdate}
                  className="w-full h-8 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  {t('updateAvailable')}
                </Button>
              )}
              {updateStatus === 'downloading' && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  {t('downloading')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
