# Twelve Data MCP Server

An MCP (Model Context Protocol) server for fetching real-time and historical market data including **forex**, **precious metals (XAUUSD, XAGUSD)**, **cryptocurrencies**, and **stocks** using the [Twelve Data API](https://twelvedata.com/).

## Features

- 📈 **Real-time prices** for forex, metals, crypto, and stocks
- 📊 **OHLC time series** data with multiple intervals (1min to monthly)
- 💱 **Currency conversion** between any supported pairs
- 📉 **Technical indicators** (RSI, MACD, SMA, EMA, Bollinger Bands, etc.)
- 🏆 **Commodities listing** (precious metals, energy, agricultural)
- ⚡ **Low latency** (~170ms average)
- 🆓 **Free tier** available (8 API credits/minute, 800/day)

## Supported Symbols

### Precious Metals
- `XAU/USD` - Gold Spot
- `XAG/USD` - Silver Spot  
- `XPT/USD` - Platinum Spot
- `XPD/USD` - Palladium Spot

### Major Forex Pairs
- `EUR/USD`, `GBP/USD`, `USD/JPY`, `USD/CHF`
- `AUD/USD`, `USD/CAD`, `NZD/USD`
- And 140+ more currency pairs

### Cryptocurrencies
- `BTC/USD`, `ETH/USD`, `XRP/USD`
- And many more from 180+ exchanges

### Stocks
- All US exchanges (NASDAQ, NYSE)
- 90+ international exchanges

## Installation

```bash
cd twelvedata-mcp-server
npm install
npm run build
```

## Configuration

### Get Your API Key

1. Sign up for free at [https://twelvedata.com/](https://twelvedata.com/)
2. Get your API key from the dashboard
3. Set the environment variable:

```bash
export TWELVEDATA_API_KEY="your_api_key_here"
```

### Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "twelvedata": {
      "command": "node",
      "args": ["/path/to/twelvedata-mcp-server/dist/index.js"],
      "env": {
        "TWELVEDATA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### `twelvedata_get_price`
Get real-time price for any symbol.

```
"Get the current gold price" → symbol: "XAU/USD"
"EURUSD price" → symbol: "EUR/USD"
```

### `twelvedata_get_quote`
Get detailed quote with OHLC, change, volume.

```
"Full quote for silver" → symbol: "XAG/USD"
```

### `twelvedata_get_time_series`
Get historical OHLC candlestick data.

```
"Get 1-hour gold candles" → symbol: "XAU/USD", interval: "1h"
"Daily EURUSD last 100 days" → symbol: "EUR/USD", interval: "1day", outputsize: 100
```

### `twelvedata_convert_currency`
Convert amounts between currencies.

```
"Convert 1000 USD to EUR" → from: "USD", to: "EUR", amount: 1000
"1 oz gold in USD" → from: "XAU", to: "USD", amount: 1
```

### `twelvedata_get_exchange_rate`
Get exchange rate for a currency pair.

```
"EUR/USD exchange rate" → symbol: "EUR/USD"
```

### `twelvedata_list_commodities`
List all available commodities.

```
"What metals can I trade?"
```

### `twelvedata_technical_indicator`
Calculate technical indicators.

```
"RSI for gold" → symbol: "XAU/USD", indicator: "rsi"
"MACD for EURUSD" → symbol: "EUR/USD", indicator: "macd"
"20-period SMA" → indicator: "sma", time_period: 20
```

**Supported indicators:** SMA, EMA, WMA, RSI, MACD, BBANDS, STOCH, ADX, ATR, CCI, OBV, MOM, ROC, WILLR

## API Rate Limits

| Plan | API Credits/min | Daily Limit | WebSocket |
|------|----------------|-------------|-----------|
| Free | 8 | 800/day | Trial only |
| Grow | 55-377 | Unlimited | Trial only |
| Pro | 610-1597 | Unlimited | ✅ |
| Ultra | 2584-10946 | Unlimited | ✅ |

## Running the Server

### Stdio Transport (default)
```bash
TWELVEDATA_API_KEY="your_key" npm start
```

### HTTP Transport
```bash
TWELVEDATA_API_KEY="your_key" TRANSPORT=http PORT=3000 npm start
```

## Development

```bash
# Build
npm run build

# Watch mode (rebuild on changes)
npm run dev
```

## Example Usage

Once configured with Claude Desktop:

> "What's the current gold price?"

> "Show me the last 50 1-hour candles for XAUUSD"

> "Calculate RSI for EUR/USD on the daily timeframe"

> "Convert 5000 USD to EUR"

> "Get a detailed quote for silver"

## License

MIT

## Credits

Data provided by [Twelve Data](https://twelvedata.com/)
