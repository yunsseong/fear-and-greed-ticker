import { useEffect, useState, useRef } from 'react'

export function Gauge({ value = 50, status = '', animate = true }) {
  const [displayValue, setDisplayValue] = useState(value)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip animation on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      setDisplayValue(value)
      return
    }

    if (animate) {
      const startValue = displayValue
      const endValue = value
      const startTime = Date.now()
      const duration = 1000

      const animateValue = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (endValue - startValue) * eased

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animateValue)
        }
      }

      animateValue()
    } else {
      setDisplayValue(value)
    }
  }, [value, animate])

  return (
    <div className="w-full space-y-1">
      {/* Progress Bar with Value */}
      <div className="relative pt-4">
        {/* Background track */}
        <div className="h-1.5 bg-muted overflow-hidden rounded-full">
          {/* Progress fill */}
          <div
            className="h-full bg-foreground transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${displayValue}%` }}
          />
        </div>

        {/* Value indicator */}
        <div
          className="absolute -top-0.5 transform -translate-x-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${displayValue}%` }}
        >
          <div className="bg-foreground text-background px-1 py-0.5 text-[10px] font-bold rounded">
            {Math.round(displayValue)}
          </div>
        </div>
      </div>

      {/* Labels and Status */}
      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
        <span>0</span>
        <span className="text-xs font-medium">{status || 'Loading...'}</span>
        <span>100</span>
      </div>
    </div>
  )
}
