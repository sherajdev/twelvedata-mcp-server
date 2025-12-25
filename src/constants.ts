// Twelve Data API Configuration
// Free tier: 8 API credits/minute, 800/day
// Sign up at: https://twelvedata.com/
export const TWELVEDATA_API_URL = "https://api.twelvedata.com";

// Character limit for responses
export const CHARACTER_LIMIT = 50000;

// Response formats
export enum ResponseFormat {
  JSON = "json",
  MARKDOWN = "markdown"
}

// Supported intervals for time series
export const SUPPORTED_INTERVALS = [
  "1min", "5min", "15min", "30min", "45min",
  "1h", "2h", "4h", "8h",
  "1day", "1week", "1month"
] as const;

export type Interval = typeof SUPPORTED_INTERVALS[number];

// Popular trading symbols for reference
export const POPULAR_SYMBOLS = {
  // Precious Metals
  XAUUSD: "Gold Spot / US Dollar",
  XAGUSD: "Silver Spot / US Dollar",
  XPTUSD: "Platinum Spot / US Dollar",
  XPDUSD: "Palladium Spot / US Dollar",
  
  // Major Forex Pairs
  "EUR/USD": "Euro / US Dollar",
  "GBP/USD": "British Pound / US Dollar",
  "USD/JPY": "US Dollar / Japanese Yen",
  "USD/CHF": "US Dollar / Swiss Franc",
  "AUD/USD": "Australian Dollar / US Dollar",
  "USD/CAD": "US Dollar / Canadian Dollar",
  "NZD/USD": "New Zealand Dollar / US Dollar",
  
  // Crypto
  "BTC/USD": "Bitcoin / US Dollar",
  "ETH/USD": "Ethereum / US Dollar",
} as const;
