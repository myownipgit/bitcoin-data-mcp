# Bitcoin Data MCP - Claude Desktop Integration Guide

A comprehensive guide to installing and configuring the Bitcoin Data MCP server with Claude Desktop.

## Prerequisites

Before installing the Bitcoin Data MCP server, ensure you have:

- **Claude Desktop** installed and updated to the latest version
  - Download from: [Claude Desktop](https://claude.ai/download)
  - Check for updates: Claude menu → "Check for Updates..."
- **Node.js** (version 16 or higher)
  - Download from: [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version` in terminal/command prompt
- **API Keys** (if required by the server)
  - Bitcoin node access credentials
  - Any external API keys needed

## Installation Methods

Choose **one** of the following installation methods:

### Method 1: Desktop Extension (Recommended)

This is the easiest method using Claude Desktop's new extension system.

#### Step 1: Download the Extension
- Download the latest `.dxt` extension file from the [releases page](https://github.com/myownipgit/bitcoin-data-mcp/releases)
- Or clone the repository and build the extension:
  ```bash
  git clone https://github.com/myownipgit/bitcoin-data-mcp.git
  cd bitcoin-data-mcp
  npm install
  npm run build:extension
  ```

#### Step 2: Install via Claude Desktop
1. Open Claude Desktop
2. Go to **Settings** → **Extensions**
3. Click **"Install Extension..."**
4. Select the downloaded `.dxt` file
5. Follow the configuration prompts (API keys, etc.)
6. Restart Claude Desktop

### Method 2: Manual JSON Configuration

This method involves manually editing Claude Desktop's configuration file.

#### Step 1: Locate Configuration File

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Step 2: Edit Configuration

Open the configuration file in a text editor and add the bitcoin-data-mcp server:

```json
{
  "mcpServers": {
    "bitcoin-data-mcp": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp"],
      "env": {
        "BITCOIN_API_KEY": "your_api_key_here",
        "BITCOIN_NETWORK": "mainnet"
      }
    }
  }
}
```

**For multiple MCP servers**, your configuration might look like:

```json
{
  "mcpServers": {
    "bitcoin-data-mcp": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp"],
      "env": {
        "BITCOIN_API_KEY": "your_api_key_here",
        "BITCOIN_NETWORK": "mainnet"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    }
  }
}
```

#### Step 3: Restart Claude Desktop

Close and restart Claude Desktop completely for the changes to take effect.

### Method 3: Docker Container (For Advanced Users)

If you prefer using Docker, you can run the Bitcoin Data MCP server in a container.

#### Step 1: Build and Run the Docker Container
```bash
# Clone the repository
git clone https://github.com/myownipgit/bitcoin-data-mcp.git
cd bitcoin-data-mcp

# Build and start with docker-compose
docker-compose up -d
```

#### Step 2: Configure Claude Desktop
1. Open Claude Desktop
2. Go to **Settings** → **Tools** or **MCP Connections**
3. Click **"Add Tool Server"**
4. Enter the following details:
   - **Name**: Bitcoin Data MCP
   - **Connection Type**: stdio
   - **Command**: `docker`
   - **Arguments**: `exec -i bitcoin-data-mcp node dist/server.js`
5. Click "Save"

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BITCOIN_API_KEY` | API key for Bitcoin data provider | - | Yes |
| `BITCOIN_NETWORK` | Network to connect to | `mainnet` | No |
| `BITCOIN_NODE_URL` | Custom Bitcoin node URL | - | No |
| `RATE_LIMIT` | API rate limit per minute | `60` | No |

### Server Arguments

You can customize the server behavior by modifying the `args` array:

```json
"args": [
  "-y", 
  "bitcoin-data-mcp",
  "--network", "testnet",
  "--cache-timeout", "300"
]
```

## Verification & Testing

### Step 1: Check Connection Status

1. Open Claude Desktop
2. Go to **Settings** → **Developer**
3. Look for "bitcoin-data-mcp" in the MCP Servers list
4. Status should show "Connected" or "Running"

### Step 2: Test Functionality

Try these sample queries in Claude Desktop:

1. **Basic Bitcoin data:**
   ```
   What's the current Bitcoin price?
   ```

2. **Block information:**
   ```
   Tell me about the latest Bitcoin block.
   ```

3. **Transaction details:**
   ```
   Give me information about Bitcoin transaction 4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b
   ```

4. **Network statistics:**
   ```
   What are the current Bitcoin network statistics?
   ```

### Step 3: Verify Tool Access

Click the **slider icon** (🔧) in the bottom-left of the Claude Desktop input box to see available tools. You should see Bitcoin-related tools listed.

## Troubleshooting

### Common Issues

#### MCP Server Not Appearing
- **Cause:** Configuration file syntax error
- **Solution:** Validate JSON syntax using a JSON validator
- **Check:** Ensure all brackets, commas, and quotes are correct

#### "Command not found" Error
- **Cause:** Node.js or npm not installed/accessible
- **Solution:** 
  ```bash
  # Verify Node.js installation
  node --version
  npm --version
  
  # Install if missing
  # Visit nodejs.org for installation instructions
  ```

#### Connection Failed
- **Cause:** Invalid API keys or network issues
- **Solution:** 
  - Verify API key is correct
  - Check network connectivity
  - Try switching to testnet for testing

#### Server Crashes on Startup
- **Cause:** Missing dependencies or configuration errors
- **Solution:** Check logs for specific error messages

### Debugging Steps

#### Check Logs

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp-server-bitcoin-data-mcp.log
```

**Windows:**
```cmd
type "%APPDATA%\Claude\logs\mcp-server-bitcoin-data-mcp.log"
```

#### Manual Server Test

Test the server independently:
```bash
npm install -g bitcoin-data-mcp
bitcoin-data-mcp
```

Or run it from the repository:
```bash
cd bitcoin-data-mcp
npm install
npm run build
npm start
```

#### Verbose Logging

Add debugging to your configuration:
```json
{
  "mcpServers": {
    "bitcoin-data-mcp": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp", "--verbose"],
      "env": {
        "DEBUG": "true",
        "BITCOIN_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Getting Help

If you're still experiencing issues:

1. **Check the logs** as described above
2. **Create an issue** on the [GitHub repository](https://github.com/myownipgit/bitcoin-data-mcp/issues)
3. **Include the following in your issue:**
   - Operating system and version
   - Claude Desktop version
   - Node.js version
   - Complete error message from logs
   - Your configuration (with API keys redacted)

## Security Considerations

- **API Keys:** Store API keys securely and never commit them to version control
- **Network Access:** The server will make external API calls to Bitcoin data providers
- **Local Access:** MCP servers run with your user permissions
- **Data Privacy:** Bitcoin queries may be logged by external services
- **Rate Limiting:** The server includes caching to prevent API abuse

## Advanced Configuration

### Custom Bitcoin Node

To use your own Bitcoin node:

```json
{
  "mcpServers": {
    "bitcoin-data-mcp": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp"],
      "env": {
        "BITCOIN_NODE_URL": "http://localhost:8332",
        "BITCOIN_RPC_USER": "your_rpc_user",
        "BITCOIN_RPC_PASSWORD": "your_rpc_password"
      }
    }
  }
}
```

### Multiple Networks

Run separate instances for different networks:

```json
{
  "mcpServers": {
    "bitcoin-mainnet": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp", "--network", "mainnet"]
    },
    "bitcoin-testnet": {
      "command": "npx",
      "args": ["-y", "bitcoin-data-mcp", "--network", "testnet"]
    }
  }
}
```

## Updating

### Desktop Extension Method
1. Download the latest extension file
2. Go to Settings → Extensions
3. Remove the old extension
4. Install the new extension file

### Manual Configuration Method
```bash
npm update -g bitcoin-data-mcp
```

Then restart Claude Desktop.

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

## Contributing

We welcome contributions! Please see our GitHub repository for guidelines.

## License

This project is licensed under the MIT License.

---

**Need help?** Open an issue on our [GitHub repository](https://github.com/myownipgit/bitcoin-data-mcp/issues).