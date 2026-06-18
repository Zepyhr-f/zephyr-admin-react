import { PlaceholderPage } from "@/components/PlaceholderPage";

export function CacheMonitoring() {
  return (
    <PlaceholderPage
      title="缓存监控"
      description="Redis 运行状态、命中率、内存占用、Key 数量等。"
      tips={["提供 Keyspace 分布与慢查询/热 Key（可选）", "命中率低时给出排查建议入口"]}
    />
  );
}
