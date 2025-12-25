// Twelve Data API Response Types
// Adding index signature for MCP SDK structuredContent compatibility

export interface PriceResponse {
  [key: string]: unknown;
  price: string;
}

export interface QuoteResponse {
  [key: string]: unknown;
  symbol: string;
  name: string;
  exchange: string;
  mic_code?: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume?: string;
  is_market_open: boolean;
  fifty_two_week?: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
    range: string;
  };
}

export interface TimeSeriesMeta {
  [key: string]: unknown;
  symbol: string;
  interval: string;
  currency: string;
  exchange_timezone: string;
  exchange: string;
  mic_code?: string;
  type: string;
}

export interface TimeSeriesValue {
  [key: string]: unknown;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

export interface TimeSeriesResponse {
  [key: string]: unknown;
  meta: TimeSeriesMeta;
  values: TimeSeriesValue[];
  status: string;
}

export interface ExchangeRateResponse {
  [key: string]: unknown;
  symbol: string;
  rate: number;
  timestamp: number;
}

export interface CurrencyConversionResponse {
  [key: string]: unknown;
  symbol: string;
  rate: number;
  amount: number;
  timestamp: number;
}

export interface ForexPair {
  [key: string]: unknown;
  symbol: string;
  currency_group: string;
  currency_base: string;
  currency_quote: string;
}

export interface ForexPairsResponse {
  [key: string]: unknown;
  data: ForexPair[];
  status: string;
}

export interface CommodityInfo {
  [key: string]: unknown;
  symbol: string;
  name: string;
  category: string;
  description: string;
}

export interface CommoditiesResponse {
  [key: string]: unknown;
  data: CommodityInfo[];
  status: string;
}

export interface TechnicalIndicatorResponse {
  [key: string]: unknown;
  meta: TimeSeriesMeta;
  values: Record<string, string>[];
  status: string;
}

export interface ApiError {
  code: number;
  message: string;
  status: string;
}

// Check if response is an error
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    (response as ApiError).status === "error"
  );
}
