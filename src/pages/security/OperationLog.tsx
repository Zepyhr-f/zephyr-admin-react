import { AdminListPage } from "@/components/AdminModulePage";
import { getOperationLogs } from "@/api/admin-modules";

export function OperationLog() {
  return <AdminListPage title="操作日志" description="记录后台修改类操作、执行结果和耗时。" loader={getOperationLogs} riskNote="详情中的 password、token、secret、连接串必须脱敏。" />;
}
