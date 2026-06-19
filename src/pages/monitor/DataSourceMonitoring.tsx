import { AdminMetricPage } from "@/components/AdminModulePage";
import { getDatasourceMetrics } from "@/api/admin-modules";

export function DataSourceMonitoring() {
  return <AdminMetricPage title="数据源监控" description="查看数据库连接状态摘要。" loader={getDatasourceMetrics} riskNote="不得展示数据库用户名、密码或完整连接串。" />;
}
