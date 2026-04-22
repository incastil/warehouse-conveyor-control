export function createMetricsState() {
  return {
    packagesCompleted: 0,
    totalDowntimeSeconds: 0,
    faultCount: 0,
    packageTimes: [], // ms per package through the full line
    throughputHistory: [], // { time, rate } last 10 minutes
    startedAt: null,
    lastThroughputCheck: null,
    recentPackageCount: 0,
  };
}

export function recordPackageCompleted(metrics, elapsedMs) {
  const now = Date.now();
  const times = [...metrics.packageTimes, elapsedMs].slice(-50);
  return {
    ...metrics,
    packagesCompleted: metrics.packagesCompleted + 1,
    recentPackageCount: metrics.recentPackageCount + 1,
    packageTimes: times,
  };
}

export function recordDowntime(metrics, seconds) {
  return {
    ...metrics,
    totalDowntimeSeconds: metrics.totalDowntimeSeconds + seconds,
  };
}

export function recordFault(metrics) {
  return {
    ...metrics,
    faultCount: metrics.faultCount + 1,
  };
}

export function updateThroughput(metrics) {
  const now = Date.now();
  if (!metrics.lastThroughputCheck) {
    return { ...metrics, lastThroughputCheck: now };
  }

  const elapsedMin = (now - metrics.lastThroughputCheck) / 60000;
  if (elapsedMin < 0.1) return metrics; // don't update too frequently

  const rate = elapsedMin > 0 ? Math.round(metrics.recentPackageCount / elapsedMin) : 0;
  const history = [...metrics.throughputHistory, { time: new Date(now).toLocaleTimeString(), rate }].slice(-10);

  return {
    ...metrics,
    throughputHistory: history,
    recentPackageCount: 0,
    lastThroughputCheck: now,
  };
}

export function getAveragePackageTime(metrics) {
  if (!metrics.packageTimes.length) return 0;
  const avg = metrics.packageTimes.reduce((a, b) => a + b, 0) / metrics.packageTimes.length;
  return (avg / 1000).toFixed(1); // seconds
}

export function getThroughputPerMinute(metrics) {
  if (!metrics.throughputHistory.length) return 0;
  return metrics.throughputHistory[metrics.throughputHistory.length - 1]?.rate || 0;
}
