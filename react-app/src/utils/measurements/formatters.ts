/**
 * Utility functions for formatting measurement values
 */

export type UnitSystem = 'metric' | 'imperial';
export type AreaUnit = 'm²' | 'ft²';
export type LengthUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in';

export interface FormattedMeasurement {
  value: number;
  formatted: string;
  unit: string;
}

/**
 * Convert centimeters to the target unit
 */
export function convertLength(
  cm: number,
  unit: LengthUnit
): number {
  switch (unit) {
    case 'm':
      return cm / 100;
    case 'cm':
      return cm;
    case 'mm':
      return cm * 10;
    case 'ft':
      return cm / 30.48;
    case 'in':
      return cm / 2.54;
    default:
      return cm;
  }
}

/**
 * Convert square centimeters to the target unit
 */
export function convertArea(
  cm2: number,
  unit: AreaUnit
): number {
  switch (unit) {
    case 'm²':
      return cm2 / 10000;
    case 'ft²':
      return cm2 / 929.0304;
    default:
      return cm2;
  }
}

/**
 * Format length with appropriate precision and unit
 */
export function formatLength(
  cm: number,
  unit: LengthUnit = 'm',
  decimals: number = 2
): FormattedMeasurement {
  const value = convertLength(cm, unit);
  const formatted = value.toFixed(decimals);
  
  return {
    value,
    formatted,
    unit,
  };
}

/**
 * Format area with appropriate precision and unit
 */
export function formatArea(
  cm2: number,
  unit: AreaUnit = 'm²',
  decimals: number = 2
): FormattedMeasurement {
  const value = convertArea(cm2, unit);
  const formatted = value.toFixed(decimals);
  
  return {
    value,
    formatted,
    unit,
  };
}

/**
 * Get display string for length
 */
export function getLengthDisplay(
  cm: number,
  unit: LengthUnit = 'm',
  decimals: number = 2
): string {
  const { formatted, unit: displayUnit } = formatLength(cm, unit, decimals);
  return `${formatted} ${displayUnit}`;
}

/**
 * Get display string for area
 */
export function getAreaDisplay(
  cm2: number,
  unit: AreaUnit = 'm²',
  decimals: number = 2
): string {
  const { formatted, unit: displayUnit } = formatArea(cm2, unit, decimals);
  return `${formatted} ${displayUnit}`;
}

/**
 * Auto-select best unit for length display
 */
export function getAutoLengthUnit(cm: number, system: UnitSystem = 'metric'): LengthUnit {
  if (system === 'imperial') {
    return cm < 30.48 ? 'in' : 'ft';
  }
  
  if (cm < 10) return 'mm';
  if (cm < 100) return 'cm';
  return 'm';
}

/**
 * Parse length string with unit (e.g., "5.5m", "180cm", "6ft")
 */
export function parseLengthString(input: string): number | null {
  const match = input.match(/^([\d.]+)\s*([a-z]+)$/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase() as LengthUnit;

  if (isNaN(value)) return null;

  // Convert to cm
  switch (unit) {
    case 'm':
      return value * 100;
    case 'cm':
      return value;
    case 'mm':
      return value / 10;
    case 'ft':
      return value * 30.48;
    case 'in':
      return value * 2.54;
    default:
      return null;
  }
}

/**
 * Get measurement precision based on zoom level
 */
export function getMeasurementPrecision(zoom: number): number {
  if (zoom < 0.5) return 0; // Zoomed out - no decimals
  if (zoom < 2) return 1;   // Medium zoom - 1 decimal
  return 2;                  // Zoomed in - 2 decimals
}
