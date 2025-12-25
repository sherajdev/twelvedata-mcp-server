import { z } from "zod";
import { ResponseFormat, SUPPORTED_INTERVALS } from "../constants.js";

// Response format enum
const responseFormat = z.nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for structured data");

// Symbol validation - accepts forex pairs (EUR/USD), metals (XAU/USD), crypto (BTC/USD), stocks (AAPL)
const symbolSchema = z.string()
  .min(1)
  .max(20)
  .describe("Trading symbol (e.g., XAU/USD, EUR/USD, BTC/USD, AAPL)");

// Interval validation
const intervalSchema = z.enum(SUPPORTED_INTERVALS)
  .describe("Time interval for data (e.g., 1min, 5min, 15min, 1h, 1day)");

// Date validation (YYYY-MM-DD)
const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .optional()
  .describe("Date in YYYY-MM-DD format");

// =============================================================================
// Schema: Get Price
// =============================================================================
export const GetPriceSchema = z.object({
  symbol: symbolSchema
    .describe("Symbol to get price for (e.g., XAU/USD for gold, EUR/USD for forex)"),
  response_format: responseFormat
}).strict();

export type GetPriceInput = z.infer<typeof GetPriceSchema>;

// =============================================================================
// Schema: Get Quote
// =============================================================================
export const GetQuoteSchema = z.object({
  symbol: symbolSchema
    .describe("Symbol to get detailed quote for (includes OHLC, change, volume)"),
  response_format: responseFormat
}).strict();

export type GetQuoteInput = z.infer<typeof GetQuoteSchema>;

// =============================================================================
// Schema: Get Time Series
// =============================================================================
export const GetTimeSeriesSchema = z.object({
  symbol: symbolSchema
    .describe("Symbol for time series data"),
  interval: intervalSchema
    .default("1day")
    .describe("Candle interval (1min, 5min, 15min, 30min, 1h, 4h, 1day, 1week)"),
  outputsize: z.number()
    .int()
    .min(1)
    .max(5000)
    .default(30)
    .describe("Number of data points to return (1-5000, default: 30)"),
  start_date: dateSchema
    .describe("Start date for historical data (YYYY-MM-DD)"),
  end_date: dateSchema
    .describe("End date for historical data (YYYY-MM-DD)"),
  response_format: responseFormat
}).strict();

export type GetTimeSeriesInput = z.infer<typeof GetTimeSeriesSchema>;

// =============================================================================
// Schema: Convert Currency
// =============================================================================
export const ConvertCurrencySchema = z.object({
  from: z.string()
    .min(3)
    .max(5)
    .describe("Source currency code (e.g., USD, EUR, XAU)"),
  to: z.string()
    .min(3)
    .max(5)
    .describe("Target currency code (e.g., EUR, JPY, USD)"),
  amount: z.number()
    .positive("Amount must be positive")
    .describe("Amount to convert"),
  response_format: responseFormat
}).strict();

export type ConvertCurrencyInput = z.infer<typeof ConvertCurrencySchema>;

// =============================================================================
// Schema: Get Exchange Rate
// =============================================================================
export const GetExchangeRateSchema = z.object({
  symbol: symbolSchema
    .describe("Currency pair for exchange rate (e.g., EUR/USD, XAU/USD)"),
  response_format: responseFormat
}).strict();

export type GetExchangeRateInput = z.infer<typeof GetExchangeRateSchema>;

// =============================================================================
// Schema: List Commodities
// =============================================================================
export const ListCommoditiesSchema = z.object({
  response_format: responseFormat
}).strict();

export type ListCommoditiesInput = z.infer<typeof ListCommoditiesSchema>;

// =============================================================================
// Schema: List Forex Pairs
// =============================================================================
export const ListForexPairsSchema = z.object({
  currency_base: z.string()
    .optional()
    .describe("Filter by base currency (e.g., USD, EUR)"),
  currency_quote: z.string()
    .optional()
    .describe("Filter by quote currency (e.g., USD, JPY)"),
  response_format: responseFormat
}).strict();

export type ListForexPairsInput = z.infer<typeof ListForexPairsSchema>;

// =============================================================================
// Schema: Get Technical Indicator
// =============================================================================
export const GetTechnicalIndicatorSchema = z.object({
  symbol: symbolSchema
    .describe("Symbol for technical analysis"),
  interval: intervalSchema
    .default("1day")
    .describe("Time interval for indicator calculation"),
  indicator: z.enum([
    "sma", "ema", "wma", "rsi", "macd", "bbands", "stoch", 
    "adx", "atr", "cci", "obv", "mom", "roc", "willr"
  ])
    .describe("Technical indicator type"),
  time_period: z.number()
    .int()
    .min(1)
    .max(200)
    .default(14)
    .describe("Time period for indicator (default: 14)"),
  outputsize: z.number()
    .int()
    .min(1)
    .max(500)
    .default(30)
    .describe("Number of data points to return"),
  response_format: responseFormat
}).strict();

export type GetTechnicalIndicatorInput = z.infer<typeof GetTechnicalIndicatorSchema>;
