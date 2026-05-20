/*
 * Ministry of ICT NetMon – AI Analyzer (Algorithmic Simulation)
 * Analyzes traffic and router metrics to generate dynamic anomalies and predictions.
 * Run with: node monitoring/ai_analyzer.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_KEY  = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const ANALYSIS_INTERVAL = 60_000; // 60 seconds

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Analysis Logic ───────────────────────────────────────────────────────────

async function analyzeAnomalies(routers, trafficAgg) {
  const anomalies = [];

  for (const router of routers) {
    if (router.status === 'offline') {
      anomalies.push({
        router_name: router.name,
        type: 'Device Offline',
        severity: 'high',
        description: `Router ${router.ip_address} has stopped responding to monitoring pings.`,
        confidence: 99,
        resolved: false,
        detected_at: new Date().toISOString()
      });
      continue; // Don't check CPU/Mem if offline
    }

    // High CPU
    if (router.cpu_usage > 85) {
      anomalies.push({
        router_name: router.name,
        type: 'CPU Spike Detected',
        severity: 'high',
        description: `Sustained high CPU utilization (${router.cpu_usage}%) detected. Potential bottleneck.`,
        confidence: 95,
        resolved: false,
        detected_at: new Date().toISOString()
      });
    } else if (router.cpu_usage > 65) {
      anomalies.push({
        router_name: router.name,
        type: 'Elevated CPU Load',
        severity: 'medium',
        description: `CPU utilization is running warm at ${router.cpu_usage}%. Monitor for further increases.`,
        confidence: 82,
        resolved: false,
        detected_at: new Date().toISOString()
      });
    }

    // Memory Leaks
    if (router.memory_usage > 90) {
      anomalies.push({
        router_name: router.name,
        type: 'Memory Exhaustion',
        severity: 'high',
        description: `Critical memory usage (${router.memory_usage}%). Device may require reboot to prevent crash.`,
        confidence: 92,
        resolved: false,
        detected_at: new Date().toISOString()
      });
    }

    // Unusual Device Count
    if (router.connected_devices > 100) {
      anomalies.push({
        router_name: router.name,
        type: 'Unusual Device Surge',
        severity: 'medium',
        description: `An unusually high number of devices (${router.connected_devices}) connected recently.`,
        confidence: 78,
        resolved: false,
        detected_at: new Date().toISOString()
      });
    }
  }

  // Traffic Analysis
  if (trafficAgg && trafficAgg.total_mbps > 500) {
    anomalies.push({
      router_name: 'Core Network',
      type: 'Bandwidth Saturation',
      severity: 'high',
      description: `Traffic volume exceeded normal baseline (${trafficAgg.total_mbps} Mbps). Possible heavy streaming or DDOS.`,
      confidence: 88,
      resolved: false,
      detected_at: new Date().toISOString()
    });
  }

  return anomalies;
}

async function generatePredictions(routers, trafficAgg) {
  const predictions = [];

  if (routers.length === 0) return predictions;

  // 1. Bandwidth Prediction
  const currentBandwidth = trafficAgg ? trafficAgg.total_mbps : 0;
  // Algorithmic forecast: Apply a sine wave factor to simulate daily traffic cycles
  const hour = new Date().getHours();
  const timeMulti = 1 + Math.sin((hour / 24) * Math.PI * 2) * 0.4; // +/- 40% variance
  const predictedBandwidth = Math.max(0, currentBandwidth * timeMulti + (Math.random() * 5));
  
  predictions.push({
    metric: 'Bandwidth Usage',
    current_value: parseFloat(currentBandwidth.toFixed(2)),
    predicted_value: parseFloat(predictedBandwidth.toFixed(2)),
    unit: 'Mbps',
    timeframe: 'Next 6 Hours',
    confidence: Math.floor(Math.random() * 15) + 75, // 75-90%
    created_at: new Date().toISOString()
  });

  // 2. Average CPU Trend
  const avgCpu = routers.reduce((sum, r) => sum + r.cpu_usage, 0) / routers.length;
  const cpuTrend = avgCpu * (1 + (Math.random() * 0.2 - 0.05)); // Slight upward bias
  
  predictions.push({
    metric: 'Average CPU Load',
    current_value: parseFloat(avgCpu.toFixed(1)),
    predicted_value: parseFloat(Math.min(100, cpuTrend).toFixed(1)),
    unit: '%',
    timeframe: 'Next 24 Hours',
    confidence: Math.floor(Math.random() * 10) + 80, // 80-90%
    created_at: new Date().toISOString()
  });

  // 3. Active Devices Forecast
  const totalDevices = routers.reduce((sum, r) => sum + r.connected_devices, 0);
  const deviceForecast = totalDevices * (1 + (Math.random() * 0.3 - 0.1));
  
  predictions.push({
    metric: 'Active Devices',
    current_value: totalDevices,
    predicted_value: Math.floor(deviceForecast),
    unit: 'devices',
    timeframe: 'Tomorrow Peak',
    confidence: Math.floor(Math.random() * 10) + 85, // 85-95%
    created_at: new Date().toISOString()
  });

  return predictions;
}

// ── Main Loop ────────────────────────────────────────────────────────────────

async function runAnalysis() {
  console.log(`[AI Analyzer] Running statistical analysis at ${new Date().toLocaleTimeString()}...`);

  // Fetch current state
  const { data: routers, error: rErr } = await supabase.from('routers').select('*');
  const { data: traffic, error: tErr } = await supabase
    .from('traffic_data')
    .select('*')
    .eq('protocol', 'AGGREGATE')
    .order('recorded_at', { ascending: false })
    .limit(1);

  if (rErr || tErr) {
    console.error(`[AI Analyzer] DB fetch error: ${rErr?.message || tErr?.message}`);
    return;
  }

  const currentTraffic = traffic && traffic.length > 0 ? traffic[0] : null;

  // Detect Anomalies
  const newAnomalies = await analyzeAnomalies(routers, currentTraffic);
  
  if (newAnomalies.length > 0) {
    // Prevent spamming the same anomaly if an unresolved one of the same type and router already exists
    const { data: existingAnomalies } = await supabase
      .from('anomalies')
      .select('*')
      .eq('resolved', false);

    const anomaliesToInsert = newAnomalies.filter(na => {
      return !existingAnomalies?.some(ea => ea.type === na.type && ea.router_name === na.router_name);
    });

    if (anomaliesToInsert.length > 0) {
      console.log(`[AI Analyzer] Detected ${anomaliesToInsert.length} new anomalies. Inserts executing...`);
      await supabase.from('anomalies').insert(anomaliesToInsert);
    }
  }

  // Generate Predictions (Replace old ones)
  const newPredictions = await generatePredictions(routers, currentTraffic);
  if (newPredictions.length > 0) {
    // Delete all existing predictions to keep the table clean (we only need current forecasts)
    await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    
    // Insert new predictions
    await supabase.from('predictions').insert(newPredictions);
    console.log(`[AI Analyzer] Generated ${newPredictions.length} new predictions.`);
  }

  // Auto-prune old resolved anomalies to keep database lean (older than 7 days)
  const cutoff = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  await supabase.from('anomalies').delete().eq('resolved', true).lt('detected_at', cutoff);
}

// ── Entry Point ──────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════');
console.log('  Ministry of ICT NetMon – AI Analyzer (Algorithmic)');
console.log(`  Supabase : ${SUPABASE_URL}`);
console.log(`  Interval : ${ANALYSIS_INTERVAL / 1000}s`);
console.log('═══════════════════════════════════════════════════\n');

// Run immediately then on interval
runAnalysis();
setInterval(runAnalysis, ANALYSIS_INTERVAL);
