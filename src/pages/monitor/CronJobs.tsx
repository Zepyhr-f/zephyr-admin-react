import { PlaceholderPage } from "@/components/PlaceholderPage";

export function CronJobs() {
  return (
    <PlaceholderPage
      title="任务调度"
      description="在线配置并管理 Cron 定时任务，支持日志追踪与失败重试。"
      tips={[
        "表格：任务名/cron/状态/上次运行/下次运行/耗时/负责人",
        "详情：执行日志 + 参数快照 + 失败原因与重试"
      ]}
    />
  );
}
