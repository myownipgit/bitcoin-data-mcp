# Integrating with Claude Desktop

This guide provides detailed instructions for integrating the Bitcoin Data MCP Server with Claude Desktop, allowing Claude to access Bitcoin blockchain data and analytics tools.

## Overview

The Model Context Protocol (MCP) allows Claude to communicate with external tools. By setting up this Bitcoin Data MCP Server as a custom tool in Claude Desktop, you can:

- Query Bitcoin blockchain data directly from Claude
- Get price information and market analysis
- Analyze network metrics and fees
- Perform UTXO analysis
- Trace transactions and detect patterns

Claude Desktop acts as the MCP client, while your locally running Bitcoin Data MCP Server acts as the MCP server, handling API requests to Blockstream.info, CoinGecko, and Mempool.space.

## Prerequisites

1. Claude Desktop installed on your computer
2. Node.js and npm installed
3. Bitcoin Data MCP Server installed and built

## Step-by-Step Integration Guide

### 1. Start the Bitcoin Data MCP Server

First, start your Bitcoin Data MCP Server:

```bash
cd bitcoin-data-mcp
npm start
```

Keep this terminal window open and running.

### 2. Configure Claude Desktop to Use the MCP Server

#### Option A: Run as Node.js Process (Recommended for Development)

1. Open Claude Desktop
2. Click on the settings icon (gear/cog)
3. Navigate to "Tools" or "MCP Connections" section
4. Click "Add Tool" or "Add Connection"
5. Enter the following details:
   - **Name**: Bitcoin Data MCP
   - **Connection Type**: stdio
   - **Command**: The full path to your server launch script (e.g., `/path/to/bitcoin-data-mcp/dist/server.js`)
   - **Working Directory**: The full path to your bitcoin-data-mcp directory
6. Click "Save" or "Add"

#### Option B: Run as Docker Container (Recommended for Production)

1. Build and start the Docker container:
   ```bash
   cd bitcoin-data-mcp
   docker-compose up -d
   ```

2. Open Claude Desktop
3. Click on the settings icon (gear/cog)
4. Navigate to "Tools" or "MCP Connections" section
5. Click "Add Tool" or "Add Connection"
6. Enter the following details:
   - **Name**: Bitcoin Data MCP
   - **Connection Type**: stdio
   - **Command**: `docker`
   - **Arguments**: `exec -i bitcoin-data-mcp node dist/server.js`
7. Click "Save" or "Add"

### 3. Verify the Connection

To verify the connection is working:

1. In Claude Desktop, you can ask something like: "Can you check if the Bitcoin Data MCP Server is connected?"
2. Claude should be able to list the available tools from the server

### 4. Example Queries

Try these example queries to test your Bitcoin Data integration:

- "What's the current Bitcoin price?"
- "Can you analyze the latest Bitcoin block for me?"
- "What are the current recommended transaction fees for Bitcoin?"
- "Check the balance of this Bitcoin address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
- "What's the current state of the Bitcoin mempool?"

### 5. Advanced Usage

Combine Claude's reasoning with Bitcoin data:

- "Analyze Bitcoin price trends over the last 30 days and explain what factors might be influencing them"
- "Compare the current fee market with previous congestion periods"
- "What would be the most efficient way to consolidate UTXOs for this address?"

## Troubleshooting

### Connection Issues

- Make sure the Bitcoin Data MCP Server is running in a terminal
- Verify the path to the server script is correct in Claude Desktop settings
- Check the server console output for any error messages

### API Limitations

- Some data sources have rate limits - the server includes caching to help with this
- Complex analyses may take a moment to complete due to multiple API calls

### Data Accuracy

- All data is sourced from public APIs and may have slight delays
- For critical financial decisions, always verify data with multiple sources

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

## Feedback and Contributions

For issues related to:

- The Bitcoin Data MCP Server: Create an issue on the GitHub repository
- Claude Desktop integration: Contact Anthropic support through the Claude Desktop application
- API limitations: Check the respective API documentation for Blockstream.info, CoinGecko, and Mempool.space