#!/usr/bin/env node

/**
 * Test script for Bitcoin Data MCP Server
 * This script sends test requests to verify server functionality
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { join } from 'path';

async function runTests() {
  console.log('Starting Bitcoin Data MCP Server test...');
  
  // Spawn the server process
  const serverProcess = spawn('node', [join(process.cwd(), 'dist', 'server.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server output for debugging
  serverProcess.stderr.on('data', (data) => {
    console.log(`Server log: ${data}`);
  });
  
  // Create a client that connects to the server via stdio
  const transport = new StdioClientTransport({
    stdin: serverProcess.stdin,
    stdout: serverProcess.stdout,
  });
  
  const client = new Client();
  await client.connect(transport);
  
  try {
    console.log('Requesting available tools...');
    const tools = await client.listTools();
    console.log(`Found ${tools.length} tools`);
    
    // Test a few key tools
    console.log('\nTesting get_price_data tool...');
    const priceResult = await client.callTool('get_price_data', {});
    console.log('Price data received:', 
      JSON.parse(priceResult.content[0].text).current_price.usd + ' USD');
    
    console.log('\nTesting get_network_metrics tool...');
    const networkResult = await client.callTool('get_network_metrics', {});
    const networkData = JSON.parse(networkResult.content[0].text);
    console.log('Network congestion:', networkData.analysis.network_congestion);
    console.log('Fee environment:', networkData.analysis.fee_environment);
    
    console.log('\nTesting analyze_fee_landscape tool...');
    const feeResult = await client.callTool('analyze_fee_landscape', {});
    const feeData = JSON.parse(feeResult.content[0].text);
    console.log('Fee recommendations:');
    console.log('- Immediate:', feeData.recommendations.immediate);
    console.log('- Standard:', feeData.recommendations.standard);
    console.log('- Economy:', feeData.recommendations.economy);
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Close the server process
    serverProcess.kill();
    console.log('Server process terminated');
  }
}

runTests().catch(console.error);