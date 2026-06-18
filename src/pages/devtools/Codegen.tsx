import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Codegen() {
  return (
    <PlaceholderPage
      title="代码生成"
      description="根据表结构生成 CRUD 与菜单 SQL；关键是模板统一、可预览与可回滚。"
      tips={["流程：选择数据源 → 选表 → 配置 → 预览 → 生成", "生成记录：可追溯、可再次生成（Diff）"]}
    />
  );
}
