import { AdminListPage } from "@/components/AdminModulePage";
import { getCodegenList } from "@/api/admin-modules";

export function Codegen() {
  return <AdminListPage title="代码生成" description="查看代码生成能力入口和表结构预览。" loader={getCodegenList} riskNote="本阶段不执行真实代码生成，不覆盖文件，不自动执行 SQL。" />;
}
