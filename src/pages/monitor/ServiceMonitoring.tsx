import { PlaceholderPage } from "@/components/PlaceholderPage";

export function ServiceMonitoring() {
  return (
    <PlaceholderPage
      title="服务监控"
      description="CPU/内存/磁盘/JVM 等指标；建议提供趋势图 + 阈值告警 + 快速定位入口。"
      tips={[
        "指标区：KPI + 近 1h/24h 趋势",
        "列表区：实例维度（Host/容器）与 TopN（CPU/内存/GC）"
      ]}
    />
  );
}
