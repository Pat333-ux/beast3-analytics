export type MetricType = "counter" | "gauge" | "histogram";

export interface MetricEvent {
  id: string;
  sourceDivision: string;
  metricName: string;
  value: number;
  type: MetricType;
  tags: Record<string, string>;
  timestamp: string;
}

export class MetricCollector {
  private metrics: MetricEvent[] = [];

  /**
   * Record a new telemetry metric event.
   */
  recordMetric(
    sourceDivision: string,
    metricName: string,
    value: number,
    type: MetricType = "gauge",
    tags: Record<string, string> = {}
  ): MetricEvent {
    const event: MetricEvent = {
      id: crypto.randomUUID(),
      sourceDivision,
      metricName,
      value,
      type,
      tags,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(event);
    return event;
  }

  /**
   * Retrieve all recorded metrics for a specific division.
   */
  getMetricsByDivision(sourceDivision: string): MetricEvent[] {
    return this.metrics.filter((m) => m.sourceDivision === sourceDivision);
  }

  /**
   * Retrieve metrics matching a specific metric name.
   */
  getMetricsByName(metricName: string): MetricEvent[] {
    return this.metrics.filter((m) => m.metricName === metricName);
  }

  /**
   * Get total metric count currently in memory.
   */
  getMetricCount(): number {
    return this.metrics.length;
  }
}

export const metricCollector = new MetricCollector();
