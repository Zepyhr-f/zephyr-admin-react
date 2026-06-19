import { AdminListPage } from "@/components/AdminModulePage";
import { getParams } from "@/api/admin-modules";

export function Params() {
  return <AdminListPage title="参数配置" description="维护系统运行参数。" loader={getParams} riskNote="敏感参数值必须遮蔽，不得在页面、日志或文档中展示真实密钥。" />;
}
