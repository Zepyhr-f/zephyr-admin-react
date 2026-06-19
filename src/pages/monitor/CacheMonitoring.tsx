import { AdminMetricPage } from "@/components/AdminModulePage";
import { getCacheMetrics } from "@/api/admin-modules";

export function CacheMonitoring() {
  return <AdminMetricPage title="缓存监控" description="查看 Redis 缓存运行摘要。" loader={getCacheMetrics} riskNote="不得展示 Redis 密码、连接串或内部网络细节。" />;
}
