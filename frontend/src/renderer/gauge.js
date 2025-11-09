/**
 * Semi-circular gauge visualization
 * Renders Fear & Greed Index gauge using HTML5 Canvas
 */

class FearGreedGauge {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.currentValue = 0;
    this.targetValue = 50;
    this.animationId = null;

    // Scale for Retina displays
    this.scale = window.devicePixelRatio || 1;
    this.canvas.width = 300 * this.scale;
    this.canvas.height = 150 * this.scale;
    this.ctx.scale(this.scale, this.scale);
  }

  /**
   * Draw the gauge
   * @param {number} value - Index value (0-100)
   * @param {boolean} animate - Whether to animate
   */
  draw(value, animate = true) {
    this.targetValue = value;

    if (animate) {
      this.animate();
    } else {
      this.currentValue = value;
      this.render();
    }
  }

  /**
   * Animate needle to target value
   */
  animate() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const startValue = this.currentValue;
    const endValue = this.targetValue;
    const startTime = Date.now();
    const duration = 1000; // 1 second

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      this.currentValue = startValue + (endValue - startValue) * eased;
      this.render();

      if (progress < 1) {
        this.animationId = requestAnimationFrame(step);
      }
    };

    step();
  }

  /**
   * Render the gauge
   */
  render() {
    const ctx = this.ctx;
    const centerX = 150;
    const centerY = 130;
    const radius = 100;

    // Clear canvas
    ctx.clearRect(0, 0, 300, 150);

    // Draw arc with gradient
    this.drawArc(centerX, centerY, radius);

    // Draw tick marks
    this.drawTicks(centerX, centerY, radius);

    // Draw needle
    this.drawNeedle(centerX, centerY, radius, this.currentValue);

    // Draw center circle with modern styling
    // Outer glow
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
    centerGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)'); // Indigo-500
    centerGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Main center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b'; // Slate-800
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#334155'; // Slate-700
    ctx.fill();
  }

  /**
   * Draw color-coded arc with modern fintech styling
   */
  drawArc(centerX, centerY, radius) {
    const ctx = this.ctx;
    const startAngle = Math.PI;
    const endAngle = Math.PI * 2;

    // Draw background arc (subtle glow)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 24;
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
    ctx.stroke();

    // Create vibrant gradient with modern fintech colors
    const gradient = ctx.createLinearGradient(centerX - radius, 0, centerX + radius, 0);
    gradient.addColorStop(0, '#ef4444');    // Red (Extreme Fear) - Tailwind red-500
    gradient.addColorStop(0.25, '#f59e0b'); // Amber (Fear) - Tailwind amber-500
    gradient.addColorStop(0.5, '#64748b');  // Slate (Neutral) - Tailwind slate-500
    gradient.addColorStop(0.75, '#22c55e'); // Green (Greed) - Tailwind green-500
    gradient.addColorStop(1, '#10b981');    // Emerald (Extreme Greed) - Tailwind emerald-500

    // Draw main arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 20;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  /**
   * Draw tick marks with modern styling
   */
  drawTicks(centerX, centerY, radius) {
    const ctx = this.ctx;
    const tickRadius = radius - 25;

    // Draw ticks at 0, 50, 100
    [0, 50, 100].forEach(value => {
      const angle = Math.PI + (Math.PI * value / 100);
      const x1 = centerX + tickRadius * Math.cos(angle);
      const y1 = centerY + tickRadius * Math.sin(angle);
      const x2 = centerX + (tickRadius - 10) * Math.cos(angle);
      const y2 = centerY + (tickRadius - 10) * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)'; // Slate-400
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw label with modern font
      const labelX = centerX + (tickRadius - 25) * Math.cos(angle);
      const labelY = centerY + (tickRadius - 25) * Math.sin(angle);
      ctx.font = '600 11px Inter, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(203, 213, 225, 0.9)'; // Slate-300
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), labelX, labelY + 4);
    });
  }

  /**
   * Draw needle pointing to value with modern fintech styling
   */
  drawNeedle(centerX, centerY, radius, value) {
    const ctx = this.ctx;
    const angle = Math.PI + (Math.PI * value / 100);
    const needleLength = radius - 30;

    const x = centerX + needleLength * Math.cos(angle);
    const y = centerY + needleLength * Math.sin(angle);

    // Draw needle shadow for depth
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw main needle with gradient
    const needleGradient = ctx.createLinearGradient(centerX, centerY, x, y);
    needleGradient.addColorStop(0, 'rgba(226, 232, 240, 0.9)'); // Slate-200
    needleGradient.addColorStop(1, 'rgba(148, 163, 184, 0.9)'); // Slate-400

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = needleGradient;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle tip with glow effect
    const tipGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
    tipGradient.addColorStop(0, '#06b6d4'); // Cyan-500
    tipGradient.addColorStop(0.5, '#0891b2'); // Cyan-600
    tipGradient.addColorStop(1, 'rgba(8, 145, 178, 0)');

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = tipGradient;
    ctx.fill();

    // Needle tip core
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
  }

  /**
   * Clear the gauge
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Export for use in renderer
window.FearGreedGauge = FearGreedGauge;
