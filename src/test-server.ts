#!/usr/bin/env node

/**
 * Test script for Bitcoin Data MCP Server
 * This simply verifies that the server starts correctly
 */

import { spawn } from 'child_process';
import { join } from 'path';

function runTest() {
  console.log('Starting Bitcoin Data MCP Server test...');
  
  // Spawn the server process
  const serverProcess = spawn('node', [join(process.cwd(), 'dist', 'server.js')], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server output for debugging
  serverProcess.stderr.on('data', (data) => {
    console.log(`Server log: ${data.toString()}`);
    
    // Look for the "running" message to confirm server started
    if (data.toString().includes('Bitcoin Data MCP Server running')) {
      console.log('Server started successfully!');
      
      // Give it a moment then exit
      setTimeout(() => {
        serverProcess.kill();
        console.log('Test completed successfully');
        process.exit(0);
      }, 1000);
    }
  });
  
  // Set a timeout to kill the server if it doesn't start
  setTimeout(() => {
    console.error('Server did not start within the timeout period');
    serverProcess.kill();
    process.exit(1);
  }, 5000);
  
  // Handle server errors
  serverProcess.on('error', (error) => {
    console.error('Server process error:', error);
    process.exit(1);
  });
  
  // Handle server exit
  serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`Server process exited with code ${code}`);
      process.exit(code);
    }
  });
}

// Run the test
runTest();