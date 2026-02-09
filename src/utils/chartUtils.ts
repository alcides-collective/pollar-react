/**
 * Chart utilities for processing and displaying charts
 * Ported from pollar-sveltekit/src/lib/utils/initCharts.ts
 */

/**
 * Polish month names for date formatting
 */
export const POLISH_MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
export const POLISH_MONTHS_FULL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

/**
 * Detect date scale from ISO date string format
 */
export type DateScale = 'year' | 'month' | 'day' | 'hour' | 'minute';

export function detectDateScale(labels: string[]): DateScale | null {
  if (labels.length === 0) return null;

  // Check if labels look like ISO dates
  const isoPatterns = {
    minute: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,  // 2025-12-20T14:30
    hour: /^\d{4}-\d{2}-\d{2}T\d{2}(:\d{2})?$/, // 2025-12-20T14 or 2025-12-20T14:00
    day: /^\d{4}-\d{2}-\d{2}(T.*)?$/,           // 2025-12-20 or 2025-12-20T... (any time suffix)
    month: /^\d{4}-\d{2}$/,                      // 2025-12
    year: /^\d{4}$/                              // 2025
  };

  // Check ALL labels and use the most granular scale found
  let hasMinute = false;
  let hasHour = false;
  let hasDay = false;
  let hasMonth = false;
  let hasYear = false;

  for (const label of labels) {
    const trimmed = label.trim();
    if (isoPatterns.minute.test(trimmed)) hasMinute = true;
    else if (isoPatterns.hour.test(trimmed)) hasHour = true;
    else if (isoPatterns.day.test(trimmed)) hasDay = true;
    else if (isoPatterns.month.test(trimmed)) hasMonth = true;
    else if (isoPatterns.year.test(trimmed)) hasYear = true;
    else return null; // Non-ISO format found
  }

  // Return the most granular scale
  if (hasMinute || hasHour) return 'minute'; // Treat hour as minute for display purposes
  if (hasDay) return 'day';
  if (hasMonth) return 'month';
  if (hasYear) return 'year';

  return null;
}

/**
 * Format ISO date label based on detected scale
 */
export function formatDateLabel(isoLabel: string, scale: DateScale): string {
  const trimmed = isoLabel.trim();

  try {
    switch (scale) {
      case 'year':
        return trimmed; // Just the year: "2025"

      case 'month': {
        // 2025-12 → "gru 2025"
        const [year, month] = trimmed.split('-');
        const monthIdx = parseInt(month, 10) - 1;
        return `${POLISH_MONTHS_SHORT[monthIdx]} ${year}`;
      }

      case 'day': {
        // 2025-12-20 → "20 gru"
        const [, month, day] = trimmed.split('-');
        const monthIdx = parseInt(month, 10) - 1;
        return `${parseInt(day, 10)} ${POLISH_MONTHS_SHORT[monthIdx]}`;
      }

      case 'hour': {
        // 2025-12-20T14:00 → "14:00"
        const timePart = trimmed.split('T')[1] || '';
        if (timePart.includes(':')) {
          return timePart.substring(0, 5); // HH:MM
        }
        return `${timePart}:00`; // Just hour → HH:00
      }

      case 'minute': {
        // 2025-12-20T14:30 → "14:30"
        const timePart = trimmed.split('T')[1] || '';
        return timePart.substring(0, 5); // HH:MM
      }

      default:
        return trimmed;
    }
  } catch {
    return trimmed; // Fallback to original
  }
}

/**
 * Parse simple chart data format: "LABEL: VALUE, LABEL: VALUE"
 */
export function parseSimpleData(str: string): { labels: string[]; values: number[] } {
  const labels: string[] = [];
  const values: number[] = [];

  str.split(',').forEach(pair => {
    const trimmed = pair.trim();
    if (!trimmed) return;

    // Find the LAST ": " to handle timestamps with colons (e.g., "2025-12-31T07:00: 4.23")
    // Look for ": " followed by a number (with optional sign)
    const match = trimmed.match(/^(.+):\s*([-+]?[\d.,]+(?:\s*-\s*[\d.,]+)?)\s*%?$/);
    if (match) {
      labels.push(match[1].trim());
      let numStr = match[2].trim();

      // Handle ranges like "72-75" - take the average
      if (numStr.includes('-') && !numStr.startsWith('-')) {
        const parts = numStr.split('-').map(p => parseFloat(p.trim().replace(',', '.')));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          values.push((parts[0] + parts[1]) / 2);
          return;
        }
      }

      // Handle Polish number format (comma as decimal separator)
      numStr = numStr.replace(',', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        values.push(num);
      }
    }
  });

  return { labels, values };
}

/**
 * Parse comparison chart data: "LABEL: prognoza=X, rzeczywista=Y; LABEL: prognoza=A, rzeczywista=B"
 */
export function parseComparisonData(str: string): { labels: string[]; forecast: number[]; actual: number[] } {
  const labels: string[] = [];
  const forecast: number[] = [];
  const actual: number[] = [];

  str.split(';').forEach(entry => {
    const trimmed = entry.trim();
    if (!trimmed) return;

    const labelMatch = trimmed.match(/^([^:]+):/);
    const forecastMatch = trimmed.match(/prognoza\s*=\s*([-+]?[\d.,]+)/i);
    const actualMatch = trimmed.match(/rzeczywista\s*=\s*([-+]?[\d.,]+)/i);

    if (labelMatch) {
      labels.push(labelMatch[1].trim());

      if (forecastMatch) {
        forecast.push(parseFloat(forecastMatch[1].replace(',', '.')));
      } else {
        forecast.push(0);
      }

      if (actualMatch) {
        actual.push(parseFloat(actualMatch[1].replace(',', '.')));
      } else {
        actual.push(0);
      }
    }
  });

  return { labels, forecast, actual };
}

/**
 * Calculate smart Y-axis bounds
 */
export function calculateYBounds(values: number[], startFromZero = false): { yMin: number; yMax: number } {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  // Use 15% padding for breathing room, minimum padding based on value magnitude
  const valuePadding = valueRange > 0
    ? valueRange * 0.15
    : Math.max(Math.abs(maxValue) * 0.1, 0.1);

  const allPositive = minValue >= 0;
  const allNegative = maxValue <= 0;

  if (startFromZero) {
    // Simple mode: always include 0 on the value axis
    if (allPositive) {
      return { yMin: 0, yMax: maxValue + valuePadding };
    } else if (allNegative) {
      return { yMin: minValue - valuePadding, yMax: 0 };
    }
    return { yMin: minValue - valuePadding, yMax: maxValue + valuePadding };
  }

  // Smart mode: zoom to data range
  let yMin = minValue - valuePadding;
  let yMax = maxValue + valuePadding;

  // Only snap to 0 if data is close to 0 (within 2x the padding)
  if (allPositive && yMin < valuePadding * 2) {
    yMin = 0;
  } else if (allNegative && yMax > -valuePadding * 2) {
    yMax = 0;
  }

  return { yMin, yMax };
}

/**
 * Parse labels to timestamps for time-proportional positioning
 */
export function parseLabelsToTimestamps(rawLabels: string[], _dateScale: DateScale): number[] {
  // Check if we have mixed formats (some date-only, some with time)
  const hasTimeFormats = rawLabels.some(l => l.includes('T'));
  const hasDateOnlyFormats = rawLabels.some(l => !l.includes('T') && /^\d{4}-\d{2}-\d{2}$/.test(l.trim()));
  const isMixedFormat = hasTimeFormats && hasDateOnlyFormats;

  return rawLabels.map(label => {
    const trimmed = label.trim();

    // Check if this specific label has time component
    const hasTime = trimmed.includes('T');

    if (hasTime) {
      // Has time - parse directly
      return new Date(trimmed).getTime();
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      // Date-only format (YYYY-MM-DD)
      if (isMixedFormat) {
        // Mixed with time formats - treat date-only as END of day (23:59)
        return new Date(trimmed + 'T23:59:00').getTime();
      } else {
        // All dates are date-only - use noon to avoid timezone issues
        return new Date(trimmed + 'T12:00:00').getTime();
      }
    } else if (/^\d{4}-\d{2}$/.test(trimmed)) {
      // Month format (YYYY-MM) - use middle of month
      return new Date(trimmed + '-15T12:00:00').getTime();
    } else if (/^\d{4}$/.test(trimmed)) {
      // Year format - use middle of year
      return new Date(trimmed + '-07-01T12:00:00').getTime();
    }
    return new Date(trimmed).getTime();
  });
}

/**
 * Color schemes for charts (Economist style)
 */
export const CHART_COLORS = {
  // Line chart colors (black/white based on theme)
  line: {
    light: {
      border: 'rgba(0, 0, 0, 0.85)',
      point: 'rgba(0, 0, 0, 0.85)',
      pointBorder: '#ffffff'
    },
    dark: {
      border: 'rgba(255, 255, 255, 0.9)',
      point: 'rgba(255, 255, 255, 0.9)',
      pointBorder: '#1f2937'
    }
  },
  // Bar chart colors (grayscale gradient)
  bar: {
    light: [
      'rgba(0, 0, 0, 0.75)',
      'rgba(0, 0, 0, 0.6)',
      'rgba(0, 0, 0, 0.45)',
      'rgba(0, 0, 0, 0.35)',
      'rgba(0, 0, 0, 0.25)',
      'rgba(0, 0, 0, 0.18)'
    ],
    dark: [
      'rgba(255, 255, 255, 0.85)',
      'rgba(255, 255, 255, 0.7)',
      'rgba(255, 255, 255, 0.55)',
      'rgba(255, 255, 255, 0.4)',
      'rgba(255, 255, 255, 0.3)',
      'rgba(255, 255, 255, 0.22)'
    ]
  },
  // Pie/stacked chart colors (editorial palette)
  pie: [
    'rgba(227, 18, 11, 0.85)',   // economist red
    'rgba(60, 60, 60, 0.85)',    // dark gray
    'rgba(150, 150, 150, 0.85)', // medium gray
    'rgba(200, 200, 200, 0.85)', // light gray
    'rgba(30, 30, 30, 0.85)',    // near black
    'rgba(120, 120, 120, 0.85)'  // gray
  ],
  // Comparison chart colors
  comparison: {
    light: {
      forecast: 'rgba(59, 130, 246, 0.6)',
      actual: 'rgba(0, 0, 0, 0.75)'
    },
    dark: {
      forecast: 'rgba(96, 165, 250, 0.7)',
      actual: 'rgba(255, 255, 255, 0.8)'
    }
  },
  // Grid/tick colors
  grid: {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(255, 255, 255, 0.1)'
  },
  tick: {
    light: 'rgba(0, 0, 0, 0.6)',
    dark: 'rgba(255, 255, 255, 0.7)'
  }
};

/**
 * Format number for display (with k/M suffixes)
 */
export function formatChartNumber(num: number): string {
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (Number.isInteger(num)) return num.toString();
  return num.toFixed(2);
}

/**
 * Check if dark mode is enabled
 */
export function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}
