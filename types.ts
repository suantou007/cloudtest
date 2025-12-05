
export interface DetailedMetricValues {
  startup: {
    total: number;
    download: number;
    injection: number;
    render: number;
  };
  runtime: {
    fps: number;
    jank: number;
    cpu: number;
    memory: number;
  };
  network: {
    rtt: number;
    throughput: number;
    loss: number;
  };
  compatibility: {
    jsError: number;
    crash: number;
  };
}

export interface DeviceMetric {
  id: string;
  os: string;
  model: string;
  tier: 'High' | 'Mid' | 'Low'; // 高档 | 中档 | 低档
  startupTime: string;
  renderTime: string;
  interactiveTime: string;
  isSlow?: boolean; // Highlight in red
  scores: {
    startup: number;
    runtime: number;
    network: number;
    compatibility: number;
  };
  details: DetailedMetricValues; // Data for the comparison view
}

export enum Tab {
  Overview = 'overview',
  Details = 'details',
}

export enum TierFilter {
  All = 'all',
  High = 'high',
  Mid = 'mid',
  Low = 'low',
}

export enum OSFilter {
  All = 'all',
  Android = 'android',
  iOS = 'ios',
}

export enum ModeFilter {
  Normal = 'normal',
  HighPerformance = 'high_perf',
}
