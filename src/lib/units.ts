import type { UnitType } from '../types'

export interface UnitGroup {
  label: string
  unitType: UnitType
  units: string[]
}

export const UNIT_GROUPS: UnitGroup[] = [
  { label: 'Metric mass', unitType: 'metric_mass', units: ['g', 'kg'] },
  { label: 'Metric volume', unitType: 'metric_volume', units: ['ml', 'l'] },
  { label: 'Imperial mass', unitType: 'imperial_mass', units: ['oz', 'lb'] },
  {
    label: 'Imperial volume',
    unitType: 'imperial_volume',
    units: ['tsp', 'tbsp', 'fl oz', 'cup', 'pint', 'quart', 'gallon'],
  },
]

const unitTypeMap = new Map<string, UnitType>(
  UNIT_GROUPS.flatMap(g => g.units.map(u => [u, g.unitType]))
)

export function getUnitType(unit: string): UnitType {
  return unitTypeMap.get(unit) ?? 'custom'
}

// ── Conversion ────────────────────────────────────────────────────────────────

// Conversion factors to base unit (grams for mass, ml for volume)
const TO_BASE: Record<string, number> = {
  g: 1, kg: 1000, oz: 28.3495, lb: 453.592,
  ml: 1, l: 1000,
  tsp: 4.92892, tbsp: 14.7868, 'fl oz': 29.5735,
  cup: 236.588, pint: 473.176, quart: 946.353, gallon: 3785.41,
}

// All mass and volume units respectively — conversions work within each group
const MASS_UNITS = ['g', 'kg', 'oz', 'lb']
const VOLUME_UNITS = ['ml', 'l', 'tsp', 'tbsp', 'fl oz', 'cup', 'pint', 'quart', 'gallon']

function physicalGroup(unitType: UnitType): string[] | null {
  if (unitType === 'metric_mass' || unitType === 'imperial_mass') return MASS_UNITS
  if (unitType === 'metric_volume' || unitType === 'imperial_volume') return VOLUME_UNITS
  return null
}

function formatQty(n: number): string {
  const rounded = Math.round(n * 100) / 100
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '')
}

export function getConversions(
  quantity: number,
  unit: string,
  unitType: UnitType,
): { quantity: string; unit: string }[] {
  const group = physicalGroup(unitType)
  if (!group || !(unit in TO_BASE)) return []
  const base = quantity * TO_BASE[unit]
  return group
    .filter(u => u !== unit)
    .map(u => ({ quantity: formatQty(base / TO_BASE[u]), unit: u }))
}
