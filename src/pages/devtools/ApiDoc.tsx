import { PlaceholderPage } from "@/components/PlaceholderPage";

export function ApiDoc() {
  return (
    <PlaceholderPage
      title="接口文档"
      description="集成 Swagger/Knife4j，支持在线预览与调试。"
      tips={["建议单独标签页打开（避免与后台主框架滚动冲突）", "生产环境注意鉴权与脱敏"]}
    />
  );
}
