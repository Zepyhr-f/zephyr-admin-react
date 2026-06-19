import { AdminMetricPage } from "@/components/AdminModulePage";
import { getSqlStatus } from "@/api/admin-modules";

export function SqlTerminal() {
  return <AdminMetricPage title="SQL 终端" description="查看 SQL 终端安全状态。" loader={getSqlStatus} riskNote="SQL 终端生产默认禁用，本阶段不开放真实 SQL 执行能力。" />;
}
