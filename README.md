# Bitcoin Data MCP Server

A Model Context Protocol (MCP) server that provides Bitcoin blockchain data and analysis tools through free data sources.

## Features

- Real-time blockchain data from Blockstream.info API
- Bitcoin price and market data from CoinGecko API
- Network metrics and fee estimates from Mempool.space API
- UTXO analysis and basic transaction pattern detection
- Data caching for improved performance and reduced API load

## Tools Available

### Blockchain Data
- `get_block`: Retrieve block information by hash or height
- `get_transaction`: Get transaction details by TXID
- `get_address`: View address information, balance, and transaction history
- `get_utxos`: Retrieve unspent transaction outputs for an address

### Market Data
- `get_price_data`: Current Bitcoin price and market metrics
- `get_historical_price`: Historical price data for specified time periods

### Network Analysis
- `get_network_metrics`: Bitcoin network health metrics
- `analyze_fee_landscape`: Current fee recommendations and analysis
- `analyze_mempool_state`: Mempool congestion analysis

### Advanced Analysis
- `analyze_utxo_distribution`: UTXO distribution analysis for multiple addresses
- `trace_coin_lineage`: Basic tracing of coin movement
- `detect_transaction_patterns`: Identify common transaction patterns

## Installation

```bash
# Clone the repository
git clone https://github.com/myownipgit/bitcoin-data-mcp.git
cd bitcoin-data-mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

## Usage

```bash
# Start the MCP server
npm start
```

The server runs on stdio, which allows it to be used as a plugin for AI models and tools that support the Model Context Protocol.

## Integration with Claude Desktop

This MCP server can be integrated with Claude Desktop to give Claude direct access to Bitcoin blockchain data without requiring internet access from Claude itself.

### Setting up Claude Desktop Integration:

1. Start your Bitcoin MCP Server:
   ```bash
   npm start
   ```

2. In Claude Desktop:
   - Open Settings
   - Navigate to the "Tools" or "MCP Connections" section
   - Add a new MCP connection by clicking "Add Tool"
   - Name: "Bitcoin Data MCP"
   - Connection Type: "stdio"
   - Command: The full path to the server launch command, e.g., `/path/to/bitcoin-data-mcp/dist/server.js`
   - Click "Save"

3. Claude will now have access to all the Bitcoin data tools provided by this server

4. Example query to Claude: "What's the current Bitcoin price and network congestion level?"

This integration allows Claude to access real-time Bitcoin data and perform analysis without needing internet access itself, as your local MCP server handles all API calls to Blockstream, CoinGecko, and Mempool.space.

## Development

```bash
# Run in development mode (build and start)
npm run dev
```

## Data Sources

- [Blockstream.info API](https://github.com/Blockstream/esplora/blob/master/API.md)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [Mempool.space API](https://mempool.space/docs/api)

## License

MIT