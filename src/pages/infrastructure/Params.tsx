import { PlaceholderPage } from "@/components/PlaceholderPage";

export function Params() {
  return (
    <PlaceholderPage
      title="参数配置"
      description="动态配置系统运行参数（如文件存储路径、默认密码等）。"
      tips={["支持灰度/版本回滚（可选）", "关键参数修改要二次确认 + 留痕"]}
    />
  );
}
