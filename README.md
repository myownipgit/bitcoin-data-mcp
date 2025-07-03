# Bitcoin Data MCP Server

A Model Context Protocol (MCP) server that provides Bitcoin blockchain data and analysis tools through free data sources.

## Features

- Real-time blockchain data from Blockstream.info API
- Bitcoin price and market data from CoinGecko API
- Network metrics and fee estimates from Mempool.space API
- UTXO analysis and basic transaction pattern detection
- Data caching for improved performance and reduced API load
- Claude Desktop integration for Bitcoin data access without direct internet access

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
git clone https://github.com/yourusername/bitcoin-data-mcp.git
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

For detailed instructions on integrating with Claude Desktop, see the [Claude Desktop Integration Guide](docs/claude-desktop-integration.md).

## Development

```bash
# Run in development mode (build and start)
npm run dev

# Run tests to verify server functionality
npm test
```

## Docker Support

You can also run the Bitcoin Data MCP Server in a Docker container:

```bash
# Build the Docker image
docker build -t bitcoin-data-mcp .

# Run the container
docker run -i bitcoin-data-mcp

# Alternatively, use docker-compose
docker-compose up
```

## Data Sources

- [Blockstream.info API](https://github.com/Blockstream/esplora/blob/master/API.md)
- [CoinGecko API](https://www.coingecko.com/en/api/documentation)
- [Mempool.space API](https://mempool.space/docs/api)

## License

MIT