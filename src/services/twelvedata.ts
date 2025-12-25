import { TWELVEDATA_API_URL } from "../constants.js";
import type {
  PriceResponse,
  QuoteResponse,
  TimeSeriesResponse,
  ExchangeRateResponse,
  CurrencyConversionResponse,
  ForexPairsResponse,
  CommoditiesResponse,
  CommodityInfo,
  TechnicalIndicatorResponse,
  ApiError
} from "../types.js";
import { isApiError } from "../types.js";

// Get API key from environment
function getApiKey(): string {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TWELVEDATA_API_KEY environment variable is required. " +
      "Sign up for free at https://twelvedata.com/ to get your API key."
    );
  }
  return apiKey;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string, 
  params: Record<string, string | number | undefined>
): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TWELVEDATA_API_URL}${endpoint}`);
  
  // Add API key
  url.searchParams.append("apikey", apiKey);
  
  // Add other params
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Twelve Data API HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as T | ApiError;
  
  if (isApiError(data)) {
    throw new Error(`Twelve Data API error: ${data.message} (code: ${data.code})`);
  }

  return data as T;
}

/**
 * Get real-time price for a symbol
 */
export async function getPrice(symbol: string): Promise<PriceResponse> {
  return fetchApi<PriceResponse>("/price", { symbol });
}

/**
 * Get detailed quote for a symbol
 */
export async function getQuote(symbol: string): Promise<QuoteResponse> {
  return fetchApi<QuoteResponse>("/quote", { symbol });
}

/**
 * Get time series (OHLC) data
 */
export async function getTimeSeries(
  symbol: string,
  interval: string,
  outputsize?: number,
  startDate?: string,
  endDate?: string
): Promise<TimeSeriesResponse> {
  return fetchApi<TimeSeriesResponse>("/time_series", {
    symbol,
    interval,
    outputsize,
    start_date: startDate,
    end_date: endDate
  });
}

/**
 * Get exchange rate between two currencies
 */
export async function getExchangeRate(
  symbol: string
): Promise<ExchangeRateResponse> {
  return fetchApi<ExchangeRateResponse>("/exchange_rate", { symbol });
}

/**
 * Convert currency amount
 */
export async function convertCurrency(
  symbol: string,
  amount: number
): Promise<CurrencyConversionResponse> {
  return fetchApi<CurrencyConversionResponse>("/currency_conversion", {
    symbol,
    amount
  });
}

/**
 * Get list of available forex pairs
 */
export async function getForexPairs(): Promise<ForexPairsResponse> {
  return fetchApi<ForexPairsResponse>("/forex_pairs", {});
}

/**
 * Get list of available commodities (metals, energy, etc.)
 */
export async function getCommodities(): Promise<CommoditiesResponse> {
  return fetchApi<CommoditiesResponse>("/commodities", {});
}

/**
 * Get technical indicator data
 */
export async function getTechnicalIndicator(
  symbol: string,
  interval: string,
  indicator: string,
  outputsize?: number,
  additionalParams?: Record<string, string | number>
): Promise<TechnicalIndicatorResponse> {
  return fetchApi<TechnicalIndicatorResponse>(`/${indicator}`, {
    symbol,
    interval,
    outputsize,
    ...additionalParams
  });
}

// =============================================================================
// Formatting Helpers
// =============================================================================

/**
 * Format price as markdown
 */
export function formatPriceAsMarkdown(symbol: string, price: string): string {
  return `**${symbol}**: ${parseFloat(price).toFixed(5)}`;
}

/**
 * Format quote as markdown
 */
export function formatQuoteAsMarkdown(quote: QuoteResponse): string {
  const changeSymbol = parseFloat(quote.change) >= 0 ? "📈" : "📉";
  const changeColor = parseFloat(quote.change) >= 0 ? "+" : "";
  
  const lines = [
    `## ${quote.symbol} - ${quote.name || "Quote"}`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| **Price** | ${parseFloat(quote.close).toFixed(5)} ${quote.currency} |`,
    `| **Change** | ${changeSymbol} ${changeColor}${quote.change} (${changeColor}${quote.percent_change}%) |`,
    `| **Open** | ${quote.open} |`,
    `| **High** | ${quote.high} |`,
    `| **Low** | ${quote.low} |`,
    `| **Previous Close** | ${quote.previous_close} |`,
    `| **Exchange** | ${quote.exchange} |`,
    `| **Timestamp** | ${quote.datetime} |`,
    `| **Market Open** | ${quote.is_market_open ? "Yes ✅" : "No ❌"} |`
  ];

  if (quote.volume) {
    lines.push(`| **Volume** | ${parseInt(quote.volume).toLocaleString()} |`);
  }

  if (quote.fifty_two_week) {
    lines.push(`| **52-Week Range** | ${quote.fifty_two_week.range} |`);
  }

  return lines.join("\n");
}

/**
 * Format time series as markdown
 */
export function formatTimeSeriesAsMarkdown(data: TimeSeriesResponse): string {
  const lines = [
    `## ${data.meta.symbol} Time Series`,
    ``,
    `**Interval:** ${data.meta.interval}`,
    `**Exchange:** ${data.meta.exchange}`,
    `**Timezone:** ${data.meta.exchange_timezone}`,
    ``,
    `| Datetime | Open | High | Low | Close |${data.values[0]?.volume !== undefined ? " Volume |" : ""}`,
    `|----------|------|------|-----|-------|${data.values[0]?.volume !== undefined ? "--------|" : ""}`
  ];

  // Limit to first 50 rows for readability
  const displayValues = data.values.slice(0, 50);
  
  displayValues.forEach(v => {
    const row = `| ${v.datetime} | ${parseFloat(v.open).toFixed(5)} | ${parseFloat(v.high).toFixed(5)} | ${parseFloat(v.low).toFixed(5)} | ${parseFloat(v.close).toFixed(5)} |`;
    if (v.volume !== undefined) {
      lines.push(`${row} ${parseInt(v.volume).toLocaleString()} |`);
    } else {
      lines.push(row);
    }
  });

  if (data.values.length > 50) {
    lines.push(``, `*...showing 50 of ${data.values.length} records*`);
  }

  return lines.join("\n");
}

/**
 * Format conversion result as markdown
 */
export function formatConversionAsMarkdown(
  result: CurrencyConversionResponse,
  fromAmount: number
): string {
  const [base, quote] = result.symbol.split("/");
  return [
    `## Currency Conversion`,
    ``,
    `**${fromAmount.toLocaleString()} ${base}** = **${(result.amount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    })} ${quote}**`,
    ``,
    `- Exchange Rate: 1 ${base} = ${result.rate.toFixed(6)} ${quote}`,
    `- Timestamp: ${new Date(result.timestamp * 1000).toISOString()}`
  ].join("\n");
}

/**
 * Format commodities list as markdown
 */
export function formatCommoditiesAsMarkdown(data: CommoditiesResponse): string {
  const lines = [
    `## Available Commodities`,
    ``,
    `| Symbol | Name | Category |`,
    `|--------|------|----------|`
  ];

  // Group by category
  const byCategory = data.data.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommodityInfo[]>);

  Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, items]) => {
      items.forEach(item => {
        lines.push(`| ${item.symbol} | ${item.name} | ${category} |`);
      });
    });

  return lines.join("\n");
}

/**
 * Format technical indicator as markdown
 */
export function formatIndicatorAsMarkdown(
  data: TechnicalIndicatorResponse,
  indicatorName: string
): string {
  const lines = [
    `## ${indicatorName.toUpperCase()} - ${data.meta.symbol}`,
    ``,
    `**Interval:** ${data.meta.interval}`,
    ``
  ];

  if (data.values.length === 0) {
    lines.push("No data available.");
    return lines.join("\n");
  }

  // Get column headers from first value
  const columns = Object.keys(data.values[0]);
  lines.push(`| ${columns.join(" | ")} |`);
  lines.push(`|${columns.map(() => "------").join("|")}|`);

  // Limit to first 30 rows
  const displayValues = data.values.slice(0, 30);
  displayValues.forEach(v => {
    const row = columns.map(col => {
      const val = v[col];
      if (col === "datetime") return val;
      const num = parseFloat(val);
      return isNaN(num) ? val : num.toFixed(5);
    });
    lines.push(`| ${row.join(" | ")} |`);
  });

  if (data.values.length > 30) {
    lines.push(``, `*...showing 30 of ${data.values.length} records*`);
  }

  return lines.join("\n");
}
