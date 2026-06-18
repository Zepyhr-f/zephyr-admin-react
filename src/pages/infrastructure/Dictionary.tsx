import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Dictionary() {
  return (
    <PlaceholderPage
      title="字典管理"
      description="维护系统固定数据（状态/性别/类别等），建议支持多语言与版本发布。"
      tips={["字典项建议不可物理删除（保留历史）", '字典变更属于"配置变更"，应计入审计日志']}
    />
  );
}
