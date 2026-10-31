import { metricCollector } from "./MetricCollector";

export interface LatencyReport {
  division: string;
  endpoint: string;
  durationMs: number;
  status: "OK" | "WARNING" | "CRITICAL";
  timestamp: string;
}

export class PerformanceMonitor {
  private reports: LatencyReport[] = [];

  /**
   * Log service response times and automatically alert if thresholds are exceeded.
   */
  logLatency(division: string, endpoint: string, durationMs: number): LatencyReport {
    let status: LatencyReport["status"] = "OK";

    if (durationMs > 1000) {
      status = "CRITICAL";
    } else if (durationMs > 300) {
      status = "WARNING";
    }

    const report: LatencyReport = {
      division,
      endpoint,
      durationMs,
      status,
      timestamp: new Date().toISOString(),
    };

    this.reports.push(report);

    // Record metric entry into MetricCollector
    metricCollector.recordMetric(division, `latency_${endpoint}`, durationMs, "histogram", {
      status,
    });

    return report;
  }

  /**
   * Get average latency across all recorded operations for a division.
   */
  getAverageLatency(division: string): number {
    const divReports = this.reports.filter((r) => r.division === division);
    if (divReports.length === 0) return 0;

    const total = divReports.reduce((acc, curr) => acc + curr.durationMs, 0);
    return Math.round(total / divReports.length);
  }

  /**
   * Get all reports experiencing WARNING or CRITICAL latencies.
   */
  getDegradedEndpoints(): LatencyReport[] {
    return this.reports.filter((r) => r.status !== "OK");
  }
}

export const performanceMonitor = new PerformanceMonitor();
