import { AdminListPage } from "@/components/AdminModulePage";
import { getNotices } from "@/api/admin-modules";

export function Notices() {
  return <AdminListPage title="通知公告" description="维护系统公告、发布状态和展示范围。" loader={getNotices} riskNote="公告富文本后续接入时必须做 XSS 防护。" />;
}
