import { AdminMetricPage } from "@/components/AdminModulePage";
import { getServerMetrics } from "@/api/admin-modules";

export function ServiceMonitoring() {
  return <AdminMetricPage title="服务监控" description="查看 Gateway 运行时、内存和基础健康摘要。" loader={getServerMetrics} />;
}
