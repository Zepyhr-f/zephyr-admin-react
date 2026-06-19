import { AdminListPage } from "@/components/AdminModulePage";
import { getFiles } from "@/api/admin-modules";

export function FileCenter() {
  return <AdminListPage title="文件管理" description="查看文件记录和下载入口。" loader={getFiles} riskNote="本阶段不开放物理删除；页面不得展示服务器本地路径或存储密钥。" />;
}
