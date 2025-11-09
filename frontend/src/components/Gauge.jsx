export function Gauge({ value = 50, status = '' }) {
  return (
    <div className="w-full space-y-1">
      {/* Progress Bar with Value */}
      <div className="relative pt-4">
        {/* Background track */}
        <div className="h-1.5 bg-muted overflow-hidden rounded-full">
          {/* Progress fill */}
          <div
            className="h-full bg-foreground transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>

        {/* Value indicator */}
        <div
          className="absolute -top-0.5 transform -translate-x-1/2 transition-all duration-1000 ease-out"
          style={{ left: `${value}%` }}
        >
          <div className="bg-foreground text-background px-1 py-0.5 text-[10px] font-bold rounded">
            {Math.round(value)}
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
