import { AdminListPage } from "@/components/AdminModulePage";
import { getDictTypes } from "@/api/admin-modules";

export function Dictionary() {
  return <AdminListPage title="字典管理" description="维护系统枚举类数据和字典项。" loader={getDictTypes} riskNote="字典变更属于配置变更，后续应进入操作审计。" />;
}
