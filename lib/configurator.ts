export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export interface OptionChoice {
  id: string;
  name: string;
  price: number;
  leadDays: number;
  desc?: string;
  icon?: string;
  hex?: string;
  displayName?: string;
}

export interface ConfigState {
  model: string;
  handleStyle: string;
  handleColor: string;
  bladeShape: string;
  bladeFinish: string;
  screwsColor: string;
  biteHandleColor: string;
  weight: string;
  extraScrewKit: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
  locale: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', rate: 1, locale: 'ar-OM' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 9.55, locale: 'ar-AE' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', rate: 9.75, locale: 'ar-SA' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', rate: 0.79, locale: 'ar-KW' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial', rate: 9.52, locale: 'ar-QA' },
  { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', rate: 0.97, locale: 'ar-BH' },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 2.42, locale: 'en-IE' },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 2.60, locale: 'en-US' },
];

export const DEFAULT_CURRENCY = 'OMR';

export function findCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export function formatPrice(omrAmount: number, currencyCode: string): string {
  const currency = findCurrency(currencyCode);
  const converted = omrAmount * currency.rate;
  const decimals = currency.code === 'OMR' || currency.code === 'KWD' || currency.code === 'BHD' ? 3 : 2;
  return `${currency.symbol} ${converted.toFixed(decimals)}`;
}

export const COLOR_SWATCHES: ColorOption[] = [
  { id: 'matt-black', name: 'Matt Black PLA', hex: '#111111' },
  { id: 'silk-silver', name: 'Silk Silver PLA', hex: '#C8C9CB' },
  { id: 'silk-red', name: 'Silk Red PLA', hex: '#E53935' },
  { id: 'silk-orange', name: 'Silk Orange PLA', hex: '#F9733E' },
  { id: 'silk-purple', name: 'Silk Purple PLA', hex: '#8E24AA' },
  { id: 'silk-blue', name: 'Silk Blue PLA', hex: '#1E88E5' },
  { id: 'hyper-white', name: 'Hyper White PLA', hex: '#FAFAFA' },
];

export const MODELS: OptionChoice[] = [
  { id: 'trainer', name: 'Trainer', price: 34, leadDays: 5, desc: 'Blunt edge. Safe for flipping practice.' },
  { id: 'display', name: 'Display Only', price: 29, leadDays: 5, desc: 'Non-functional. For collectors and shelves.' },
];

export const HANDLE_STYLES: OptionChoice[] = [
  { id: 'honeycomb', name: 'Honeycomb', price: 0, leadDays: 0, desc: 'Hex pocket texture for grip without bulk.', icon: 'honeycomb' },
  { id: 'arrow', name: 'Arrow Serrated', price: 3, leadDays: 1, desc: 'Directional serrations lock into your palm.', icon: 'arrow' },
];

export const BLADE_SHAPES: OptionChoice[] = [
  {
    id: 'Sharp_Bladeglb',
    name: 'Sharp_Bladeglb',
    displayName: 'Sharp blade',
    price: 5,
    leadDays: 1,
    desc: 'Angular tip with a strong tactical profile.',
  },
  {
    id: 'Knife_Bladeglb',
    name: 'Knife_Bladeglb',
    displayName: 'Knife blade',
    price: 5,
    leadDays: 1,
    desc: 'Classic clipped spine with a sharper, more agile tip.',
  },
  {
    id: 'Moon_Bladeglb',
    name: 'Moon_Bladeglb',
    displayName: 'Moon blade',
    price: 3,
    leadDays: 0,
    desc: 'Smooth all-round profile with a stronger everyday-use tip.',
  },
];

export const BLADE_FINISHES: OptionChoice[] = [
  { id: 'matt-black', name: 'Matt Black PLA', price: 0, leadDays: 0, hex: '#111111' },
  { id: 'silk-silver', name: 'Silk Silver PLA', price: 2, leadDays: 1, hex: '#C8C9CB' },
  { id: 'silk-red', name: 'Silk Red PLA', price: 2, leadDays: 1, hex: '#E53935' },
  { id: 'silk-orange', name: 'Silk Orange PLA', price: 2, leadDays: 1, hex: '#F9733E' },
  { id: 'silk-purple', name: 'Silk Purple PLA', price: 2, leadDays: 1, hex: '#8E24AA' },
  { id: 'silk-blue', name: 'Silk Blue PLA', price: 2, leadDays: 1, hex: '#1E88E5' },
  { id: 'hyper-white', name: 'Hyper White PLA', price: 2, leadDays: 1, hex: '#FAFAFA' },
];

export const SCREWS_COLORS: OptionChoice[] = [
  { id: 'matt-black', name: 'Matt Black', price: 0, leadDays: 0, hex: '#111111' },
  { id: 'silk-silver', name: 'Silk Silver', price: 0, leadDays: 0, hex: '#C8C9CB' },
  { id: 'silk-red', name: 'Silk Red', price: 2, leadDays: 1, hex: '#E53935' },
  { id: 'silk-orange', name: 'Silk Orange', price: 2, leadDays: 1, hex: '#F9733E' },
  { id: 'silk-purple', name: 'Silk Purple', price: 2, leadDays: 1, hex: '#8E24AA' },
  { id: 'silk-blue', name: 'Silk Blue', price: 2, leadDays: 1, hex: '#1E88E5' },
  { id: 'hyper-white', name: 'Hyper White', price: 2, leadDays: 1, hex: '#FAFAFA' },
];

export const WEIGHTS: OptionChoice[] = [
  { id: 'light', name: 'Light', price: 0, leadDays: 0, desc: 'Fast, snappy flips. ~115g.' },
  { id: 'standard', name: 'Standard', price: 0, leadDays: 0, desc: 'Balanced all-rounder. ~140g.' },
  { id: 'heavy', name: 'Heavy', price: 5, leadDays: 1, desc: 'Momentum for tricks. ~165g.' },
];

export const DEFAULT_CONFIG: ConfigState = {
  model: 'trainer',
  handleStyle: 'honeycomb',
  handleColor: 'matt-black',
  bladeShape: 'Moon_Bladeglb',
  bladeFinish: 'matt-black',
  screwsColor: 'matt-black',
  biteHandleColor: 'matt-black',
  weight: 'standard',
  extraScrewKit: false,
};

export const BUTTERFLY_GLB_PATH = '/assets/models/Butterfly_Knife.glb';

export function findOption(list: OptionChoice[], id: string): OptionChoice | undefined {
  return list.find(o => o.id === id);
}

export function findColor(id: string): ColorOption | undefined {
  return COLOR_SWATCHES.find(c => c.id === id);
}

export function getColorHex(id: string): string {
  const color = COLOR_SWATCHES.find(c => c.id === id)
    || BLADE_FINISHES.find(c => c.id === id);
  return color?.hex || '#111111';
}

export const BW_COLORS = new Set(['matt-black', 'hyper-white']);

export function isBW(colorId: string): boolean {
  return BW_COLORS.has(colorId);
}

export function handleUnitPrice(style: string, colorId: string, sameColor: boolean): number {
  if (sameColor) {
    return isBW(colorId) ? 1.4 : 1.1;
  }
  if (style === 'arrow') {
    return isBW(colorId) ? 0.9 : 0.7;
  }
  return isBW(colorId) ? 1.1 : 0.7;
}

export function bladeUnitPrice(shape: string, colorId: string): number {
  const bw = isBW(colorId);
  switch (shape) {
    case 'Knife_Bladeglb': return bw ? 0.7 : 0.6;
    case 'Sharp_Bladeglb': return bw ? 0.8 : 0.6;
    case 'Moon_Bladeglb':  return bw ? 0.7 : 0.6;
    default:               return bw ? 0.7 : 0.6;
  }
}

export function screwsUnitPrice(colorId: string): number {
  return isBW(colorId) ? 0.6 : 0.5;
}

export function calculatePrice(config: ConfigState): { total: number; breakdown: { label: string; price: number }[] } {
  const breakdown: { label: string; price: number }[] = [];

  const model = findOption(MODELS, config.model);
  if (model) breakdown.push({ label: `${model.name} base`, price: model.price });

  const handle = findOption(HANDLE_STYLES, config.handleStyle);
  const handleName = handle?.name || config.handleStyle;
  const sameColor = config.handleColor === config.biteHandleColor;

  const leftPrice = handleUnitPrice(config.handleStyle, config.handleColor, sameColor);
  const rightPrice = handleUnitPrice(config.handleStyle, config.biteHandleColor, sameColor);
  breakdown.push({ label: `${handleName} handle (left)`, price: leftPrice });
  breakdown.push({ label: `${handleName} handle (right)`, price: rightPrice });

  const blade = findOption(BLADE_SHAPES, config.bladeShape);
  const bladeName = blade?.displayName || blade?.name || config.bladeShape;
  const bladePrice = bladeUnitPrice(config.bladeShape, config.bladeFinish);
  breakdown.push({ label: `${bladeName}`, price: bladePrice });

  const screwsPrice = screwsUnitPrice(config.screwsColor);
  breakdown.push({ label: 'Screws & pins (2 screws, 4 washers)', price: screwsPrice });

  const weight = findOption(WEIGHTS, config.weight);
  if (weight && weight.price > 0) breakdown.push({ label: `${weight.name} weight kit`, price: weight.price });

  if (config.extraScrewKit) breakdown.push({ label: 'Extra Screw & Pin Kit', price: 5 });

  const total = breakdown.reduce((sum, b) => sum + b.price, 0);
  return { total, breakdown };
}

export function calculateLeadDays(config: ConfigState): number {
  let days = 5;
  const model = findOption(MODELS, config.model);
  if (model) days = Math.max(days, model.leadDays);

  [HANDLE_STYLES, BLADE_SHAPES, BLADE_FINISHES, SCREWS_COLORS, WEIGHTS].forEach(list => {
    const key = list === HANDLE_STYLES ? config.handleStyle
      : list === BLADE_SHAPES ? config.bladeShape
      : list === BLADE_FINISHES ? config.bladeFinish
      : list === SCREWS_COLORS ? config.screwsColor
      : config.weight;
    const opt = findOption(list, key);
    if (opt) days += opt.leadDays;
  });

  return days;
}

export function estimateShipDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function buildShareUrl(config: ConfigState): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams();
  Object.entries(config).forEach(([k, v]) => params.set(k, String(v)));
  return `${window.location.origin}/configurator?${params.toString()}`;
}

export function parseConfigFromUrl(): Partial<ConfigState> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (params.toString() === '') return null;
  const config: any = {};
  params.forEach((v, k) => {
    if (k in DEFAULT_CONFIG) config[k] = v;
  });
  return config;
}
