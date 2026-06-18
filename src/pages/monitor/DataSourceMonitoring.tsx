import { PlaceholderPage } from "@/components/PlaceholderPage";

export function DataSourceMonitoring() {
  return (
    <PlaceholderPage
      title="数据源监控"
      description="Druid 连接池状态、慢 SQL 统计与连接泄漏风险提示。"
      tips={["慢 SQL：支持跳转到调用链/接口（如已接入 Trace）", "连接池指标：active/max/wait/borrow/success"]}
    />
  );
}
