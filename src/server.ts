#!/usr/bin/env node

/**
 * Bitcoin Data MCP Server - Tier 1 Implementation
 * Free data sources: Blockstream.info, CoinGecko free tier, Mempool.space
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import NodeCache from 'node-cache';

// Types
interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash?: string;
  nonce: number;
  bits: number;
  difficulty: number;
}

interface Transaction {
  txid: string;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address?: string;
      value: number;
    };
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  }>;
}

interface AddressInfo {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number;
}

interface PriceData {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

interface NetworkMetrics {
  difficulty: number;
  hashrate: number;
  mempool_size: number;
  fee_estimates: { [key: string]: number };
}

// Data Provider Classes
class BlockstreamProvider {
  private baseUrl = 'https://blockstream.info/api';
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
  }

  async getBlock(hashOrHeight: string): Promise<Block> {
    const cacheKey = `block:${hashOrHeight}`;
    const cached = this.cache.get<Block>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/block/${hashOrHeight}`);
      const block = response.data;
      this.cache.set(cacheKey, block);
      return block;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch block: ${error}`);
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    const cacheKey = `tx:${txid}`;
    const cached = this.cache.get<Transaction>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/tx/${txid}`);
      const tx = response.data;
      this.cache.set(cacheKey, tx);
      return tx;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch transaction: ${error}`);
    }
  }

  async getAddress(address: string): Promise<AddressInfo> {
    const cacheKey = `addr:${address}`;
    const cached = this.cache.get<AddressInfo>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/address/${address}`);
      const addressInfo = response.data;
      this.cache.set(cacheKey, addressInfo);
      return addressInfo;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch address: ${error}`);
    }
  }

  async getAddressUTXOs(address: string): Promise<UTXO[]> {
    const cacheKey = `utxos:${address}`;
    const cached = this.cache.get<UTXO[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.baseUrl}/address/${address}/utxo`);
      const utxos = response.data;
      this.cache.set(cacheKey, utxos, 60); // 1 minute cache for UTXOs
      return utxos;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch UTXOs: ${error}`);
    }
  }

  async getAddressTransactions(address: string, lastSeenTxid?: string): Promise<Transaction[]> {
    try {
      let url = `${this.baseUrl}/address/${address}/txs`;
      if (lastSeenTxid) {
        url += `/chain/${lastSeenTxid}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch address transactions: ${error}`);
    }
  }
}

class CoinGeckoProvider {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache
  }

  async getPrice(): Promise<PriceData> {
    const cacheKey = 'btc:price';
    const cached = this.cache.get<PriceData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.baseUrl}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      const data = response.data;
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch price: ${error}`);
    }
  }

  async getHistoricalPrice(days: number = 30): Promise<Array<[number, number]>> {
    const cacheKey = `btc:history:${days}`;
    const cached = this.cache.get<Array<[number, number]>>(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
      );
      const prices = response.data.prices;
      this.cache.set(cacheKey, prices, 1800); // 30 minute cache for historical data
      return prices;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch historical price: ${error}`);
    }
  }
}

class MempoolSpaceProvider {
  private baseUrl = 'https://mempool.space/api';
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache
  }

  async getNetworkMetrics(): Promise<NetworkMetrics> {
    const cacheKey = 'network:metrics';
    const cached = this.cache.get<NetworkMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const [difficultyResponse, hashrateResponse, mempoolResponse, feesResponse] = 
        await Promise.all([
          axios.get(`${this.baseUrl}/v1/difficulty-adjustment`),
          axios.get(`${this.baseUrl}/v1/hashrate`),
          axios.get(`${this.baseUrl}/mempool`),
          axios.get(`${this.baseUrl}/v1/fees/recommended`)
        ]);

      const metrics: NetworkMetrics = {
        difficulty: difficultyResponse.data.difficultyChange,
        hashrate: hashrateResponse.data.currentHashrate,
        mempool_size: mempoolResponse.data.count,
        fee_estimates: feesResponse.data
      };

      this.cache.set(cacheKey, metrics);
      return metrics;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch network metrics: ${error}`);
    }
  }

  async getFeeEstimates(): Promise<{ [key: string]: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/fees/recommended`);
      return response.data;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch fee estimates: ${error}`);
    }
  }

  async getMempoolInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/mempool`);
      return response.data;
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to fetch mempool info: ${error}`);
    }
  }
}

// Main MCP Server Class
class BitcoinDataMCP {
  private server: Server;
  private blockstream: BlockstreamProvider;
  private coingecko: CoinGeckoProvider;
  private mempool: MempoolSpaceProvider;

  constructor() {
    this.server = new Server(
      {
        name: 'bitcoin-data-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.blockstream = new BlockstreamProvider();
    this.coingecko = new CoinGeckoProvider();
    this.mempool = new MempoolSpaceProvider();

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Blockchain Data Tools
        {
          name: 'get_block',
          description: 'Get block information by hash or height',
          inputSchema: {
            type: 'object',
            properties: {
              block_hash_or_height: { type: 'string', description: 'Block hash or height' },
              include_transactions: { type: 'boolean', description: 'Include transaction details', default: false }
            },
            required: ['block_hash_or_height']
          }
        },
        {
          name: 'get_transaction',
          description: 'Get transaction information by txid',
          inputSchema: {
            type: 'object',
            properties: {
              txid: { type: 'string', description: 'Transaction ID' },
              include_analysis: { type: 'boolean', description: 'Include basic analysis', default: false }
            },
            required: ['txid']
          }
        },
        {
          name: 'get_address',
          description: 'Get address information including balance and transaction history',
          inputSchema: {
            type: 'object',
            properties: {
              address: { type: 'string', description: 'Bitcoin address' },
              limit: { type: 'number', description: 'Limit number of transactions', default: 25 },
              offset: { type: 'number', description: 'Offset for pagination', default: 0 }
            },
            required: ['address']
          }
        },
        {
          name: 'get_utxos',
          description: 'Get unspent transaction outputs for an address',
          inputSchema: {
            type: 'object',
            properties: {
              address: { type: 'string', description: 'Bitcoin address' },
              min_value: { type: 'number', description: 'Minimum UTXO value in satoshis', default: 0 }
            },
            required: ['address']
          }
        },
        
        // Market Data Tools
        {
          name: 'get_price_data',
          description: 'Get current Bitcoin price and market data',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: { type: 'string', description: 'Timeframe for historical data', default: 'current' }
            }
          }
        },
        {
          name: 'get_historical_price',
          description: 'Get historical Bitcoin price data',
          inputSchema: {
            type: 'object',
            properties: {
              days: { type: 'number', description: 'Number of days of historical data', default: 30 }
            }
          }
        },
        
        // Network Analysis Tools
        {
          name: 'get_network_metrics',
          description: 'Get Bitcoin network health metrics',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: { type: 'string', description: 'Timeframe for metrics', default: 'current' }
            }
          }
        },
        {
          name: 'analyze_fee_landscape',
          description: 'Analyze current fee landscape and get recommendations',
          inputSchema: {
            type: 'object',
            properties: {
              prediction_horizon: { type: 'string', description: 'Fee prediction horizon', default: 'current' }
            }
          }
        },
        {
          name: 'analyze_mempool_state',
          description: 'Analyze current mempool state',
          inputSchema: {
            type: 'object',
            properties: {
              include_predictions: { type: 'boolean', description: 'Include basic predictions', default: false }
            }
          }
        },

        // Analysis Tools
        {
          name: 'analyze_utxo_distribution',
          description: 'Analyze UTXO distribution for multiple addresses',
          inputSchema: {
            type: 'object',
            properties: {
              address_list: { type: 'array', items: { type: 'string' }, description: 'List of Bitcoin addresses' }
            },
            required: ['address_list']
          }
        },
        {
          name: 'trace_coin_lineage',
          description: 'Trace the lineage of coins from a transaction output',
          inputSchema: {
            type: 'object',
            properties: {
              txid: { type: 'string', description: 'Transaction ID' },
              output_index: { type: 'number', description: 'Output index' },
              depth: { type: 'number', description: 'Trace depth', default: 3 }
            },
            required: ['txid', 'output_index']
          }
        },
        {
          name: 'detect_transaction_patterns',
          description: 'Detect patterns in a transaction (basic analysis)',
          inputSchema: {
            type: 'object',
            properties: {
              txid: { type: 'string', description: 'Transaction ID' }
            },
            required: ['txid']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_block':
            return await this.handleGetBlock(args);
          case 'get_transaction':
            return await this.handleGetTransaction(args);
          case 'get_address':
            return await this.handleGetAddress(args);
          case 'get_utxos':
            return await this.handleGetUTXOs(args);
          case 'get_price_data':
            return await this.handleGetPriceData(args);
          case 'get_historical_price':
            return await this.handleGetHistoricalPrice(args);
          case 'get_network_metrics':
            return await this.handleGetNetworkMetrics(args);
          case 'analyze_fee_landscape':
            return await this.handleAnalyzeFees(args);
          case 'analyze_mempool_state':
            return await this.handleAnalyzeMempool(args);
          case 'analyze_utxo_distribution':
            return await this.handleAnalyzeUTXODistribution(args);
          case 'trace_coin_lineage':
            return await this.handleTraceCoinLineage(args);
          case 'detect_transaction_patterns':
            return await this.handleDetectTransactionPatterns(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error}`);
      }
    });
  }

  // Tool Handler Methods
  private async handleGetBlock(args: any) {
    const { block_hash_or_height, include_transactions = false } = args;
    const block = await this.blockstream.getBlock(block_hash_or_height);
    
    let result: any = {
      block_info: block,
      analysis: {
        size_efficiency: block.weight / block.size,
        transaction_density: block.tx_count / block.size,
        avg_transaction_size: block.size / block.tx_count
      }
    };

    if (include_transactions) {
      result.note = "Transaction details require individual transaction queries due to API limitations";
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetTransaction(args: any) {
    const { txid, include_analysis = false } = args;
    const transaction = await this.blockstream.getTransaction(txid);
    
    let result: any = { transaction };

    if (include_analysis) {
      result.analysis = {
        input_count: transaction.vin.length,
        output_count: transaction.vout.length,
        total_input_value: transaction.vin.reduce((sum, input) => 
          sum + (input.prevout?.value || 0), 0),
        total_output_value: transaction.vout.reduce((sum, output) => 
          sum + output.value, 0),
        fee_rate: transaction.fee / transaction.size,
        is_confirmed: transaction.status.confirmed,
        block_height: transaction.status.block_height
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetAddress(args: any) {
    const { address, limit = 25 } = args;
    const [addressInfo, utxos, recentTxs] = await Promise.all([
      this.blockstream.getAddress(address),
      this.blockstream.getAddressUTXOs(address),
      this.blockstream.getAddressTransactions(address)
    ]);

    const balance = addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum;
    const pendingBalance = addressInfo.mempool_stats.funded_txo_sum - addressInfo.mempool_stats.spent_txo_sum;

    const result = {
      address_info: addressInfo,
      balance: {
        confirmed: balance,
        unconfirmed: pendingBalance,
        total: balance + pendingBalance
      },
      utxo_count: utxos.length,
      recent_transactions: recentTxs.slice(0, limit),
      analysis: {
        transaction_count: addressInfo.chain_stats.tx_count,
        avg_transaction_value: balance / Math.max(addressInfo.chain_stats.tx_count, 1),
        utxo_efficiency: utxos.length > 0 ? balance / utxos.length : 0
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetUTXOs(args: any) {
    const { address, min_value = 0 } = args;
    const utxos = await this.blockstream.getAddressUTXOs(address);
    
    const filteredUTXOs = utxos.filter(utxo => utxo.value >= min_value);
    const totalValue = filteredUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);

    const result = {
      utxos: filteredUTXOs,
      summary: {
        count: filteredUTXOs.length,
        total_value: totalValue,
        average_value: totalValue / Math.max(filteredUTXOs.length, 1),
        largest_utxo: Math.max(...filteredUTXOs.map(u => u.value), 0),
        smallest_utxo: Math.min(...filteredUTXOs.map(u => u.value), 0)
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetPriceData(args: any) {
    const priceData = await this.coingecko.getPrice();
    
    const result = {
      current_price: priceData.bitcoin,
      analysis: {
        price_trend: priceData.bitcoin.usd_24h_change > 0 ? 'bullish' : 'bearish',
        volatility_indicator: Math.abs(priceData.bitcoin.usd_24h_change),
        market_cap_rank: 1, // Bitcoin is always #1
        volume_to_market_cap_ratio: 
          priceData.bitcoin.usd_24h_vol / priceData.bitcoin.usd_market_cap
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetHistoricalPrice(args: any) {
    const { days = 30 } = args;
    const historicalData = await this.coingecko.getHistoricalPrice(days);
    
    const prices = historicalData.map(([timestamp, price]) => ({ timestamp, price }));
    const firstPrice = prices[0]?.price || 0;
    const lastPrice = prices[prices.length - 1]?.price || 0;
    const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

    const result = {
      data_points: prices.length,
      period_days: days,
      price_data: prices,
      analysis: {
        period_return: totalReturn,
        highest_price: Math.max(...prices.map(p => p.price)),
        lowest_price: Math.min(...prices.map(p => p.price)),
        average_price: prices.reduce((sum, p) => sum + p.price, 0) / prices.length
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleGetNetworkMetrics(args: any) {
    const metrics = await this.mempool.getNetworkMetrics();
    
    const result = {
      network_metrics: metrics,
      analysis: {
        network_congestion: metrics.mempool_size > 50000 ? 'high' : 
                           metrics.mempool_size > 20000 ? 'medium' : 'low',
        fee_environment: metrics.fee_estimates.fastestFee > 100 ? 'expensive' :
                        metrics.fee_estimates.fastestFee > 50 ? 'moderate' : 'cheap',
        security_assessment: 'high' // Bitcoin network is considered highly secure
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleAnalyzeFees(args: any) {
    const fees = await this.mempool.getFeeEstimates();
    
    const result = {
      current_fees: fees,
      recommendations: {
        immediate: `${fees.fastestFee} sat/vB for next block`,
        standard: `${fees.halfHourFee} sat/vB for 30 min confirmation`,
        economy: `${fees.hourFee} sat/vB for 1 hour confirmation`
      },
      analysis: {
        fee_level: fees.fastestFee > 100 ? 'high' : 
                   fees.fastestFee > 50 ? 'medium' : 'low',
        spread: fees.fastestFee - fees.hourFee,
        priority_premium: ((fees.fastestFee - fees.hourFee) / fees.hourFee) * 100
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleAnalyzeMempool(args: any) {
    const mempoolInfo = await this.mempool.getMempoolInfo();
    
    const result = {
      mempool_state: mempoolInfo,
      analysis: {
        congestion_level: mempoolInfo.count > 50000 ? 'high' : 
                         mempoolInfo.count > 20000 ? 'medium' : 'low',
        average_fee_rate: mempoolInfo.total_fee / mempoolInfo.vsize,
        memory_usage_mb: mempoolInfo.usage / 1024 / 1024,
        capacity_utilization: (mempoolInfo.count / 300000) * 100 // rough estimate
      },
      predictions: args.include_predictions ? {
        likely_clear_time: mempoolInfo.count < 10000 ? '< 1 hour' :
                          mempoolInfo.count < 50000 ? '1-6 hours' : '> 6 hours',
        fee_trend: 'stable' // Basic prediction
      } : null
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleAnalyzeUTXODistribution(args: any) {
    const { address_list } = args;
    
    const utxoPromises = address_list.map((addr: string) => 
      this.blockstream.getAddressUTXOs(addr).catch(() => [])
    );
    const allUTXOs = await Promise.all(utxoPromises);
    
    const flatUTXOs = allUTXOs.flat();
    const totalValue = flatUTXOs.reduce((sum, utxo) => sum + utxo.value, 0);
    
    const result = {
      addresses_analyzed: address_list.length,
      total_utxos: flatUTXOs.length,
      distribution_analysis: {
        total_value: totalValue,
        average_utxo_value: totalValue / Math.max(flatUTXOs.length, 1),
        largest_utxo: Math.max(...flatUTXOs.map(u => u.value), 0),
        smallest_utxo: Math.min(...flatUTXOs.map(u => u.value), 0),
        dust_utxos: flatUTXOs.filter(u => u.value < 546).length
      },
      privacy_analysis: {
        utxo_consolidation_opportunity: flatUTXOs.length > 20 ? 'high' : 'low',
        dust_ratio: (flatUTXOs.filter(u => u.value < 546).length / flatUTXOs.length) * 100
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleTraceCoinLineage(args: any) {
    const { txid, output_index, depth = 3 } = args;
    
    const result: any = {
      starting_point: { txid, output_index },
      trace_depth: depth,
      lineage: [] as any[],
      analysis: {
        note: "Basic lineage tracing implemented. Full graph analysis requires additional data sources."
      }
    };

    try {
      let currentTxid = txid;
      let currentOutput = output_index;
      
      for (let i = 0; i < depth; i++) {
        const tx = await this.blockstream.getTransaction(currentTxid);
        
        if (tx.vout[currentOutput]) {
          const output = tx.vout[currentOutput];
          result.lineage.push({
            level: i,
            txid: currentTxid,
            output_index: currentOutput,
            value: output.value,
            address: output.scriptpubkey_address,
            script_type: output.scriptpubkey_type
          });

          // Find next transaction that spends this output (simplified)
          // In a full implementation, this would require additional indexing
          break;
        }
      }
    } catch (error) {
      result.analysis.error = `Trace incomplete: ${error}`;
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  private async handleDetectTransactionPatterns(args: any) {
    const { txid } = args;
    const transaction = await this.blockstream.getTransaction(txid);
    
    const patterns = [];
    
    // Basic pattern detection
    if (transaction.vin.length === 1 && transaction.vout.length === 2) {
      patterns.push('simple_payment');
    }
    
    if (transaction.vout.length > 10) {
      patterns.push('batch_payment');
    }
    
    if (transaction.vin.length > 5) {
      patterns.push('consolidation');
    }
    
    // Check for round numbers (possible exchange activity)
    const hasRoundAmounts = transaction.vout.some(output => 
      output.value % 100000000 === 0 || output.value % 10000000 === 0
    );
    if (hasRoundAmounts) {
      patterns.push('round_amounts');
    }

    const result = {
      transaction_id: txid,
      detected_patterns: patterns,
      analysis: {
        input_count: transaction.vin.length,
        output_count: transaction.vout.length,
        total_value: transaction.vout.reduce((sum, out) => sum + out.value, 0),
        fee_rate: transaction.fee / transaction.size,
        pattern_confidence: patterns.length > 0 ? 'medium' : 'low',
        note: "Basic pattern detection. Advanced analysis requires additional data sources."
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Bitcoin Data MCP Server running on stdio');
  }
}

// Run the server
const server = new BitcoinDataMCP();
server.run().catch(console.error);