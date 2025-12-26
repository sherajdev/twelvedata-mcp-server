import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import cors from "cors";

import { ResponseFormat } from "./constants.js";
import {
  GetPriceSchema,
  GetQuoteSchema,
  GetTimeSeriesSchema,
  ConvertCurrencySchema,
  GetExchangeRateSchema,
  ListCommoditiesSchema,
  GetTechnicalIndicatorSchema,
  type GetPriceInput,
  type GetQuoteInput,
  type GetTimeSeriesInput,
  type ConvertCurrencyInput,
  type GetExchangeRateInput,
  type ListCommoditiesInput,
  type GetTechnicalIndicatorInput
} from "./schemas/twelvedata.js";
import {
  getPrice,
  getQuote,
  getTimeSeries,
  convertCurrency,
  getExchangeRate,
  getCommodities,
  getTechnicalIndicator,
  formatPriceAsMarkdown,
  formatQuoteAsMarkdown,
  formatTimeSeriesAsMarkdown,
  formatConversionAsMarkdown,
  formatCommoditiesAsMarkdown,
  formatIndicatorAsMarkdown
} from "./services/twelvedata.js";

// Initialize MCP Server
const server = new McpServer({
  name: "twelvedata-mcp-server",
  version: "1.0.0"
});

// =============================================================================
// TOOL: twelvedata_get_price
// =============================================================================
server.registerTool(
  "twelvedata_get_price",
  {
    title: "Get Real-Time Price",
    description: `Get the current real-time price for any trading symbol.

Supports forex pairs, precious metals, crypto, and stocks. This is the fastest endpoint for getting current prices.

**Symbols examples:**
- Metals: XAU/USD (gold), XAG/USD (silver), XPT/USD (platinum)
- Forex: EUR/USD, GBP/USD, USD/JPY
- Crypto: BTC/USD, ETH/USD
- Stocks: AAPL, MSFT, GOOGL

Args:
  - symbol (string): Trading symbol (e.g., "XAU/USD", "EUR/USD", "BTC/USD")
  - response_format ('markdown' | 'json'): Output format

Returns:
  Current price of the symbol.

Examples:
  - "What's the current gold price?" -> symbol: "XAU/USD"
  - "Get EURUSD price" -> symbol: "EUR/USD"
  - "Bitcoin price now" -> symbol: "BTC/USD"`,
    inputSchema: GetPriceSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetPriceInput) => {
    try {
      const data = await getPrice(params.symbol);
      
      if (params.response_format === ResponseFormat.JSON) {
        const output = { symbol: params.symbol, price: data.price };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      }
      
      const markdown = formatPriceAsMarkdown(params.symbol, data.price);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_get_quote
// =============================================================================
server.registerTool(
  "twelvedata_get_quote",
  {
    title: "Get Detailed Quote",
    description: `Get comprehensive quote data including OHLC, change, volume, and 52-week range.

More detailed than get_price - includes open, high, low, close, previous close, change percentage, and market status.

Args:
  - symbol (string): Trading symbol (e.g., "XAU/USD", "EUR/USD")
  - response_format ('markdown' | 'json'): Output format

Returns:
  Detailed quote with:
  - Current price (close)
  - Open, High, Low
  - Previous close
  - Change and percent change
  - Volume (if available)
  - 52-week range (if available)
  - Market open/closed status

Examples:
  - "Get full gold quote" -> symbol: "XAU/USD"
  - "EURUSD detailed info" -> symbol: "EUR/USD"`,
    inputSchema: GetQuoteSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetQuoteInput) => {
    try {
      const data = await getQuote(params.symbol);
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = formatQuoteAsMarkdown(data);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_get_time_series
// =============================================================================
server.registerTool(
  "twelvedata_get_time_series",
  {
    title: "Get OHLC Time Series",
    description: `Get historical OHLC (Open, High, Low, Close) candlestick data.

Perfect for chart analysis, backtesting, and historical price research. Supports multiple timeframes from 1-minute to monthly data.

Args:
  - symbol (string): Trading symbol
  - interval (string): Candle interval - "1min", "5min", "15min", "30min", "1h", "4h", "1day", "1week", "1month"
  - outputsize (number): Number of candles to return (1-5000, default: 30)
  - start_date (string, optional): Start date YYYY-MM-DD
  - end_date (string, optional): End date YYYY-MM-DD
  - response_format ('markdown' | 'json'): Output format

Returns:
  Array of OHLC candles with datetime, open, high, low, close, and volume (where applicable).

Examples:
  - "Get 1-hour gold candles" -> symbol: "XAU/USD", interval: "1h"
  - "Daily EURUSD last 100 days" -> symbol: "EUR/USD", interval: "1day", outputsize: 100
  - "5-minute BTC data" -> symbol: "BTC/USD", interval: "5min"`,
    inputSchema: GetTimeSeriesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetTimeSeriesInput) => {
    try {
      const data = await getTimeSeries(
        params.symbol,
        params.interval,
        params.outputsize,
        params.start_date,
        params.end_date
      );
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = formatTimeSeriesAsMarkdown(data);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_convert_currency
// =============================================================================
server.registerTool(
  "twelvedata_convert_currency",
  {
    title: "Convert Currency",
    description: `Convert an amount from one currency to another using real-time rates.

Supports fiat currencies, precious metals (XAU, XAG), and cryptocurrencies.

Args:
  - from (string): Source currency code (e.g., "USD", "EUR", "XAU", "BTC")
  - to (string): Target currency code
  - amount (number): Amount to convert
  - response_format ('markdown' | 'json'): Output format

Returns:
  Converted amount with exchange rate.

Examples:
  - "Convert 1000 USD to EUR" -> from: "USD", to: "EUR", amount: 1000
  - "How much is 1 oz gold in USD?" -> from: "XAU", to: "USD", amount: 1
  - "Convert 0.5 BTC to USD" -> from: "BTC", to: "USD", amount: 0.5`,
    inputSchema: ConvertCurrencySchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: ConvertCurrencyInput) => {
    try {
      const symbol = `${params.from}/${params.to}`;
      const data = await convertCurrency(symbol, params.amount);
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = formatConversionAsMarkdown(data, params.amount);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_get_exchange_rate
// =============================================================================
server.registerTool(
  "twelvedata_get_exchange_rate",
  {
    title: "Get Exchange Rate",
    description: `Get the current exchange rate for a currency pair.

Args:
  - symbol (string): Currency pair (e.g., "EUR/USD", "XAU/USD")
  - response_format ('markdown' | 'json'): Output format

Returns:
  Current exchange rate with timestamp.

Examples:
  - "EUR/USD exchange rate" -> symbol: "EUR/USD"
  - "Gold rate" -> symbol: "XAU/USD"`,
    inputSchema: GetExchangeRateSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetExchangeRateInput) => {
    try {
      const data = await getExchangeRate(params.symbol);
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = [
        `## Exchange Rate: ${data.symbol}`,
        ``,
        `**Rate:** ${data.rate.toFixed(6)}`,
        `**Timestamp:** ${new Date(data.timestamp * 1000).toISOString()}`
      ].join("\n");
      
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_list_commodities
// =============================================================================
server.registerTool(
  "twelvedata_list_commodities",
  {
    title: "List Available Commodities",
    description: `Get a list of all available commodities including precious metals, energy, and agricultural products.

Args:
  - response_format ('markdown' | 'json'): Output format

Returns:
  List of commodities with symbols, names, and categories.
  Categories include: Precious Metal (gold, silver, platinum), Energy (oil, natural gas), Agricultural, etc.

Examples:
  - "What metals can I trade?" -> lists all available commodities
  - "Show available commodities" -> full list`,
    inputSchema: ListCommoditiesSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: ListCommoditiesInput) => {
    try {
      const data = await getCommodities();
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = formatCommoditiesAsMarkdown(data);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }]
      };
    }
  }
);

// =============================================================================
// TOOL: twelvedata_technical_indicator
// =============================================================================
server.registerTool(
  "twelvedata_technical_indicator",
  {
    title: "Get Technical Indicator",
    description: `Calculate technical indicators for a symbol.

Supports popular indicators for technical analysis.

**Available indicators:**
- Trend: SMA, EMA, WMA, ADX
- Momentum: RSI, MACD, MOM, ROC, STOCH, WILLR, CCI
- Volatility: BBANDS (Bollinger Bands), ATR
- Volume: OBV

Args:
  - symbol (string): Trading symbol
  - interval (string): Time interval for calculation
  - indicator (string): Indicator type (sma, ema, rsi, macd, bbands, stoch, adx, atr, etc.)
  - time_period (number): Period for calculation (default: 14)
  - outputsize (number): Number of data points (default: 30)
  - response_format ('markdown' | 'json'): Output format

Returns:
  Indicator values with timestamps.

Examples:
  - "RSI for gold" -> symbol: "XAU/USD", indicator: "rsi"
  - "MACD for EURUSD daily" -> symbol: "EUR/USD", indicator: "macd", interval: "1day"
  - "20-period SMA for BTC" -> symbol: "BTC/USD", indicator: "sma", time_period: 20`,
    inputSchema: GetTechnicalIndicatorSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true
    }
  },
  async (params: GetTechnicalIndicatorInput) => {
    try {
      const data = await getTechnicalIndicator(
        params.symbol,
        params.interval,
        params.indicator,
        params.outputsize,
        { time_period: params.time_period }
      );
      
      if (params.response_format === ResponseFormat.JSON) {
        return {
          content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          structuredContent: data
        };
      }
      
      const markdown = formatIndicatorAsMarkdown(data, params.indicator);
      return { content: [{ type: "text", text: markdown }] };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}. Note: Some indicators require paid plans.` }]
      };
    }
  }
);

// =============================================================================
// Transport Handlers
// =============================================================================

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Twelve Data MCP Server running on stdio");
  console.error("Ensure TWELVEDATA_API_KEY environment variable is set");
}

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "twelvedata-mcp-server" });
  });

  // MCP endpoint (Streamable HTTP)
  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // SSE transport for n8n compatibility
  const sseTransports = new Map<string, SSEServerTransport>();

  app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    sseTransports.set(transport.sessionId, transport);

    res.on("close", () => {
      sseTransports.delete(transport.sessionId);
    });

    await server.connect(transport);
    await transport.start();
  });

  app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = sseTransports.get(sessionId);

    if (!transport) {
      res.status(400).json({ error: "Invalid or expired session" });
      return;
    }

    await transport.handlePostMessage(req, res);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.error(`Twelve Data MCP Server running on http://localhost:${port}`);
    console.error(`  - Streamable HTTP: POST /mcp`);
    console.error(`  - SSE: GET /sse, POST /messages`);
    console.error("Ensure TWELVEDATA_API_KEY environment variable is set");
  });
}

// Choose transport based on environment
const transport = process.env.TRANSPORT || "stdio";
if (transport === "http") {
  runHTTP().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
