import { PlaceholderPage } from "@/components/PlaceholderPage";

export function SqlTerminal() {
  return (
    <PlaceholderPage
      title="SQL 终端"
      description="轻量 Web SQL 面板（生产环境受限）；强调权限、审计与风险控制。"
      tips={[
        "限制：只读/白名单库表/最大返回行数/超时",
        "所有执行必须落操作日志（含 SQL 摘要与风险等级）"
      ]}
    />
  );
}
