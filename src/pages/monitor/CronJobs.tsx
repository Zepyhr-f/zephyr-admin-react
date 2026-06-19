import { AdminListPage } from "@/components/AdminModulePage";
import { getCronJobs } from "@/api/admin-modules";

export function CronJobs() {
  return <AdminListPage title="任务调度" description="查看调度任务列表和执行状态。" loader={getCronJobs} riskNote="本阶段不开放真实执行、暂停、恢复或删除任务。" />;
}
