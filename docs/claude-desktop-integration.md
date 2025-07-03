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

### 2. Configure Claude Desktop

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

## Additional Notes

- The server communicates with Claude Desktop through stdio, keeping your data local
- No API keys are required for the basic functionality
- All API calls are made from your computer, not from Claude's servers

## Feedback and Contributions

If you encounter issues or have suggestions for improving the Claude Desktop integration, please open an issue or pull request on the GitHub repository.