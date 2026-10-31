import { metricCollector, MetricType } from "../core/MetricCollector";
import { performanceMonitor } from "../core/PerformanceMonitor";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class AnalyticsAPIHandler {
  /**
   * Ingest telemetry metrics from any division.
   * POST /api/analytics/metrics
   */
  static recordMetric(body: {
    sourceDivision: string;
    metricName: string;
    value: number;
    type?: MetricType;
    tags?: Record<string, string>;
  }): APIResponse<any> {
    if (!body.sourceDivision || !body.metricName || body.value === undefined) {
      return {
        success: false,
        error: "Missing required fields: sourceDivision, metricName, or value.",
        timestamp: new Date().toISOString(),
      };
    }

    const metric = metricCollector.recordMetric(
      body.sourceDivision,
      body.metricName,
      body.value,
      body.type || "gauge",
      body.tags || {}
    );

    return {
      success: true,
      data: metric,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Record service latency observation.
   * POST /api/analytics/latency
   */
  static logLatency(body: {
    division: string;
    endpoint: string;
    durationMs: number;
  }): APIResponse<any> {
    if (!body.division || !body.endpoint || body.durationMs === undefined) {
      return {
        success: false,
        error: "Missing required fields: division, endpoint, or durationMs.",
        timestamp: new Date().toISOString(),
      };
    }

    const report = performanceMonitor.logLatency(
      body.division,
      body.endpoint,
      body.durationMs
    );

    return {
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get global system health overview.
   * GET /api/analytics/health
   */
  static getSystemHealth(): APIResponse<any> {
    const degraded = performanceMonitor.getDegradedEndpoints();
    const totalMetrics = metricCollector.getMetricCount();

    return {
      success: true,
      data: {
        totalMetricsCollected: totalMetrics,
        degradedEndpointsCount: degraded.length,
        degradedEndpoints: degraded,
        systemStatus: degraded.length === 0 ? "HEALTHY" : "DEGRADED",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
