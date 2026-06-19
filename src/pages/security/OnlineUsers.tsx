import { AdminListPage } from "@/components/AdminModulePage";
import { getOnlineUsers } from "@/api/admin-modules";

export function OnlineUsers() {
  return <AdminListPage title="在线用户" description="展示当前在线会话摘要。" loader={getOnlineUsers} riskNote="只展示 token 摘要，不展示完整 token；强退能力后续必须二次确认。" />;
}
