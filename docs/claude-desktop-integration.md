# Claude Desktop Integration Guide for Bitcoin Data MCP Server

This guide explains how to integrate the Bitcoin Data MCP Server with Claude Desktop, allowing Claude to access Bitcoin blockchain data and analytics without direct internet access.

## Prerequisites

- Node.js (v16+)
- npm (v7+)
- Claude Desktop application
- Bitcoin Data MCP Server repository

## Setup Instructions

### 1. Install and Configure the Bitcoin Data MCP Server

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/myownipgit/bitcoin-data-mcp.git
cd bitcoin-data-mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### 2. Configure Claude Desktop to Use the MCP Server

#### Option A: Run as Node.js Process (Recommended for Development)

1. Open Claude Desktop
2. Go to Settings > Experimental Features
3. Enable "Local Tools"
4. Under "Tools Configuration," click "Add Tool Server"
5. Fill in the following details:
   - Name: `Bitcoin Data`
   - Type: `Subprocess`
   - Command: Full path to Node.js executable (e.g., `/usr/local/bin/node`)
   - Arguments: Full path to the built server.js file (e.g., `/path/to/bitcoin-data-mcp/dist/server.js`)
6. Click "Save"

#### Option B: Run as Docker Container (Recommended for Production)

1. Build and start the Docker container:
   ```bash
   cd bitcoin-data-mcp
   docker-compose up -d
   ```

2. Open Claude Desktop
3. Go to Settings > Experimental Features
4. Enable "Local Tools"
5. Under "Tools Configuration," click "Add Tool Server"
6. Fill in the following details:
   - Name: `Bitcoin Data`
   - Type: `Subprocess`
   - Command: `docker`
   - Arguments: `exec -i bitcoin-data-mcp node dist/server.js`
7. Click "Save"

### 3. Start a New Conversation in Claude Desktop

Once you've configured the tool server, start a new conversation with Claude and verify that the Bitcoin Data tools are available.

## Available Tools and Example Queries

### Blockchain Data Tools

#### Get Block Information
```
Could you show me the information for Bitcoin block 680000?
```

#### Get Transaction Details
```
Please analyze this Bitcoin transaction: 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
```

#### Get Address Information
```
What's the balance and transaction history for Bitcoin address bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4?
```

#### Get Unspent Transaction Outputs (UTXOs)
```
Show me the UTXOs for address bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
```

### Market Data Tools

#### Get Current Price Data
```
What's the current Bitcoin price and market data?
```

#### Get Historical Price Data
```
Show me Bitcoin's price history for the last 14 days
```

### Network Analysis Tools

#### Get Network Metrics
```
What's the current state of the Bitcoin network?
```

#### Analyze Fee Landscape
```
What are the current recommended Bitcoin transaction fees?
```

#### Analyze Mempool State
```
How congested is the Bitcoin mempool right now?
```

### Advanced Analysis Tools

#### Analyze UTXO Distribution
```
Analyze the UTXO distribution for these addresses:
- bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4
- 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
```

#### Trace Coin Lineage
```
Can you trace the lineage of coins from transaction 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b, output index 0?
```

#### Detect Transaction Patterns
```
Detect patterns in Bitcoin transaction 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
```

## Troubleshooting

### Tool Not Appearing in Claude Desktop

1. Check that your server built correctly with `npm run build`
2. Verify the paths in the Claude Desktop tool configuration
3. Restart Claude Desktop
4. Check the Claude Desktop logs for any errors

### API Connection Issues

The server uses public APIs which may have rate limits or occasional downtime:

- Blockstream.info API
- CoinGecko API
- Mempool.space API

If you encounter "Failed to fetch" errors, try again later as it may be due to API rate limiting.

### Timeouts on Large Requests

For operations involving multiple addresses or deep transaction analysis, you may encounter timeouts. Consider:

1. Reducing the number of addresses analyzed simultaneously
2. Limiting the trace depth in lineage analysis
3. Breaking up complex queries into simpler ones

## Integration with Other Tools

### Slack Integration

You can integrate the Bitcoin Data MCP Server with Claude via Slack by:

1. Setting up the MCP server as described above
2. Configuring your Slack workspace to use Claude
3. When interacting with Claude in Slack, you can ask Bitcoin-related questions that will be processed through this MCP server

### Web Applications

The Bitcoin Data MCP Server can be used in web applications by:

1. Running the server in a Docker container or as a Node.js process
2. Using the MCP protocol to communicate with the server from your web application
3. Processing Bitcoin data in your application without direct API access

## Security Considerations

- The Bitcoin Data MCP Server doesn't store or log any sensitive information
- All data is sourced from public APIs and blockchain explorers
- No private keys or credentials are ever used or requested
- The server runs locally and communicates only with the client (Claude Desktop, Slack, etc.) via stdio
- Uses rate limiting and caching to prevent API abuse

## Support and Feedback

For issues related to:

- The Bitcoin Data MCP Server: Create an issue on the GitHub repository
- Claude Desktop integration: Contact Anthropic support through the Claude Desktop application
- API limitations: Check the respective API documentation for Blockstream.info, CoinGecko, and Mempool.space