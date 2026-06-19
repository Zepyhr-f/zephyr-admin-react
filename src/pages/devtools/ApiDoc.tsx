import { AdminMetricPage } from "@/components/AdminModulePage";
import { getApiDocInfo } from "@/api/admin-modules";

export function ApiDoc() {
  return <AdminMetricPage title="接口文档" description="展示 Gateway 与后端服务 OpenAPI/Swagger 文档入口。" loader={getApiDocInfo} />;
}
