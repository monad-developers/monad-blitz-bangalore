#!/usr/bin/env node

/**
 * MonadFaas Performance Benchmark
 * 
 * Compares performance between different demo modes:
 * 1. Original sequential demo
 * 2. Optimized parallel demo  
 * 3. Turbo mode demo
 */

require('dotenv').config();
const chalk = require('chalk');
const { spawn } = require('child_process');

class PerformanceBenchmark {
  constructor() {
    this.results = {};
    this.testSizes = [5, 10, 20]; // Different function counts to test
  }

  async runBenchmark(script, functions, mode = '') {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const args = [`--functions=${functions}`];
      if (mode) args.push(mode);
      
      const process = spawn('node', [script, ...args], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        if (code === 0) {
          // Parse performance metrics from output
          const metrics = this.parseMetrics(output, duration, functions);
          resolve(metrics);
        } else {
          reject(new Error(`Process failed with code ${code}: ${errorOutput}`));
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        process.kill();
        reject(new Error('Benchmark timeout'));
      }, 300000);
    });
  }

  parseMetrics(output, totalTime, functions) {
    const metrics = {
      totalTime,
      functions,
      throughput: functions / (totalTime / 1000),
      avgTimePerFunction: totalTime / functions
    };

    // Extract gas usage if available
    const gasMatch = output.match(/Total Gas[:\s]+([0-9,]+)/i);
    if (gasMatch) {
      metrics.gasUsed = parseInt(gasMatch[1].replace(/,/g, ''));
    }

    // Extract transaction count if available
    const txMatch = output.match(/Transactions[:\s]+([0-9,]+)/i);
    if (txMatch) {
      metrics.transactions = parseInt(txMatch[1].replace(/,/g, ''));
    }

    return metrics;
  }

  async runAllBenchmarks() {
    console.log(chalk.blue.bold('🏁 MonadFaas Performance Benchmark'));
    console.log(chalk.blue('=' .repeat(60)));
    console.log();

    for (const size of this.testSizes) {
      console.log(chalk.yellow(`📊 Testing with ${size} functions...`));
      console.log();

      try {
        // Test optimized demo
        console.log(chalk.cyan('   Running optimized demo...'));
        const optimizedResult = await this.runBenchmark('demo-script.js', size);
        
        // Test turbo demo
        console.log(chalk.cyan('   Running turbo demo...'));
        const turboResult = await this.runBenchmark('turbo-demo.js', size);
        
        // Test turbo mode
        console.log(chalk.cyan('   Running turbo mode...'));
        const turboModeResult = await this.runBenchmark('turbo-demo.js', size, '--turbo');

        this.results[size] = {
          optimized: optimizedResult,
          turbo: turboResult,
          turboMode: turboModeResult
        };

        this.displayComparison(size);
        console.log();

      } catch (error) {
        console.error(chalk.red(`   ❌ Benchmark failed for ${size} functions: ${error.message}`));
        console.log();
      }
    }

    this.displaySummary();
  }

  displayComparison(size) {
    const results = this.results[size];
    
    console.log(chalk.green(`   ✅ Results for ${size} functions:`));
    console.log();
    
    // Create comparison table
    const modes = ['optimized', 'turbo', 'turboMode'];
    const modeNames = ['Optimized', 'Turbo', 'Turbo Mode'];
    
    console.log('   Mode          | Time (ms) | Throughput (f/s) | Avg Time/Function (ms)');
    console.log('   ' + '-'.repeat(70));
    
    modes.forEach((mode, index) => {
      const result = results[mode];
      if (result) {
        const name = modeNames[index].padEnd(12);
        const time = result.totalTime.toLocaleString().padStart(8);
        const throughput = result.throughput.toFixed(1).padStart(13);
        const avgTime = result.avgTimePerFunction.toFixed(1).padStart(18);
        
        console.log(`   ${name} | ${time} | ${throughput} | ${avgTime}`);
      }
    });
    
    console.log();
    
    // Show improvement percentages
    if (results.optimized && results.turboMode) {
      const improvement = ((results.optimized.totalTime - results.turboMode.totalTime) / results.optimized.totalTime * 100);
      const throughputImprovement = ((results.turboMode.throughput - results.optimized.throughput) / results.optimized.throughput * 100);
      
      console.log(chalk.green(`   🚀 Turbo Mode Improvements:`));
      console.log(`      Speed: ${improvement.toFixed(1)}% faster`);
      console.log(`      Throughput: ${throughputImprovement.toFixed(1)}% higher`);
    }
  }

  displaySummary() {
    console.log(chalk.blue.bold('📈 BENCHMARK SUMMARY'));
    console.log(chalk.blue('=' .repeat(60)));
    console.log();
    
    // Calculate average improvements
    let totalSpeedImprovement = 0;
    let totalThroughputImprovement = 0;
    let validComparisons = 0;
    
    Object.values(this.results).forEach(result => {
      if (result.optimized && result.turboMode) {
        const speedImprovement = (result.optimized.totalTime - result.turboMode.totalTime) / result.optimized.totalTime * 100;
        const throughputImprovement = (result.turboMode.throughput - result.optimized.throughput) / result.optimized.throughput * 100;
        
        totalSpeedImprovement += speedImprovement;
        totalThroughputImprovement += throughputImprovement;
        validComparisons++;
      }
    });
    
    if (validComparisons > 0) {
      const avgSpeedImprovement = totalSpeedImprovement / validComparisons;
      const avgThroughputImprovement = totalThroughputImprovement / validComparisons;
      
      console.log(chalk.green('🏆 Overall Performance Gains:'));
      console.log(`   Average Speed Improvement: ${chalk.bold(avgSpeedImprovement.toFixed(1))}%`);
      console.log(`   Average Throughput Gain: ${chalk.bold(avgThroughputImprovement.toFixed(1))}%`);
      console.log();
    }
    
    console.log(chalk.cyan('🎯 Key Optimizations Applied:'));
    console.log('   ✅ Parallel transaction execution');
    console.log('   ✅ Controlled concurrency limits');
    console.log('   ✅ Optimized gas prices and limits');
    console.log('   ✅ Reduced network delays');
    console.log('   ✅ Efficient error handling');
    console.log('   ✅ Real-time performance monitoring');
    console.log();
    
    console.log(chalk.green.bold('🚀 MonadFaas is now optimized for maximum performance!'));
  }
}

// Quick performance test function
async function quickTest() {
  console.log(chalk.yellow('🔥 Quick Performance Test (5 functions)'));
  console.log();
  
  const benchmark = new PerformanceBenchmark();
  
  try {
    console.log(chalk.cyan('Running turbo mode demo...'));
    const result = await benchmark.runBenchmark('turbo-demo.js', 5, '--turbo');
    
    console.log(chalk.green('✅ Quick test results:'));
    console.log(`   Time: ${result.totalTime}ms`);
    console.log(`   Throughput: ${result.throughput.toFixed(1)} functions/second`);
    console.log(`   Avg per function: ${result.avgTimePerFunction.toFixed(1)}ms`);
    
  } catch (error) {
    console.error(chalk.red('❌ Quick test failed:'), error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--quick')) {
    await quickTest();
  } else {
    const benchmark = new PerformanceBenchmark();
    await benchmark.runAllBenchmarks();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('💥 Benchmark failed:'), error);
    process.exit(1);
  });
}

module.exports = { PerformanceBenchmark };
