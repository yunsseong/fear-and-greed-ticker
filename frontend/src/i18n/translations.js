export const translations = {
  en: {
    // Tabs
    stock: 'Stock',
    crypto: 'Crypto',

    // Gauge labels
    currentIndex: 'Current Index',

    // Fear & Greed status
    extremeFear: 'Extreme Fear',
    fear: 'Fear',
    neutral: 'Neutral',
    greed: 'Greed',
    extremeGreed: 'Extreme Greed',

    // Historical Data
    historicalData: 'Historical Data',
    previousClose: 'Previous Close',
    oneWeekAgo: '1 Week Ago',
    oneMonthAgo: '1 Month Ago',
    oneYearAgo: '1 Year Ago',

    // Loading
    loading: 'Loading...',

    // Settings
    settings: 'Settings',
    launchAtLogin: 'Launch at Login',
    defaultIndexType: 'Default Index Type',
    stockMarket: 'Stock Market',
    cryptocurrency: 'Cryptocurrency',
    language: 'Language',
    english: 'English',
    korean: '한국어',
    backToDashboard: 'Back to Dashboard',
    checkForUpdates: 'Check for Updates',
    checking: 'Checking...',
    upToDate: 'Up to date',
    updateAvailable: 'Update available',
    downloading: 'Downloading...',
    readyToInstall: 'Ready to install',
    updates: 'Updates',
  },

  ko: {
    // Tabs
    stock: '주식',
    crypto: '암호화폐',

    // Gauge labels
    currentIndex: '현재 지수',

    // Fear & Greed status
    extremeFear: '극도의 공포',
    fear: '공포',
    neutral: '중립',
    greed: '탐욕',
    extremeGreed: '극도의 탐욕',

    // Historical Data
    historicalData: '과거 데이터',
    previousClose: '전일 종가',
    oneWeekAgo: '1주 전',
    oneMonthAgo: '1개월 전',
    oneYearAgo: '1년 전',

    // Loading
    loading: '로딩 중...',

    // Settings
    settings: '설정',
    launchAtLogin: '로그인 시 실행',
    defaultIndexType: '기본 지수 유형',
    stockMarket: '주식 시장',
    cryptocurrency: '암호화폐',
    language: '언어',
    english: 'English',
    korean: '한국어',
    backToDashboard: '대시보드로 돌아가기',
    checkForUpdates: '업데이트 확인',
    checking: '확인 중...',
    upToDate: '최신 버전',
    updateAvailable: '업데이트 가능',
    downloading: '다운로드 중...',
    readyToInstall: '설치 준비 완료',
    updates: '업데이트',
  }
}

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

export const translateStatus = (status, lang) => {
  const statusMap = {
    'Extreme Fear': 'extremeFear',
    'Fear': 'fear',
    'Neutral': 'neutral',
    'Greed': 'greed',
    'Extreme Greed': 'extremeGreed'
  }

  const translationKey = statusMap[status]
  return translationKey ? getTranslation(lang, translationKey) : status
}
