import { AdminListPage } from "@/components/AdminModulePage";
import { getLoginLogs } from "@/api/admin-modules";

export function LoginLog() {
  return <AdminListPage title="登录日志" description="记录登录成功、失败、登出等认证行为。" loader={getLoginLogs} riskNote="日志参数必须脱敏，不展示完整 token 或密码。" />;
}
