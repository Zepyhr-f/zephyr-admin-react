import client from "./client";

export interface AdminListResp<T = Record<string, unknown>> {
  records: T[];
  total: number;
  current: number;
  size: number;
}

export interface MetricResp {
  [key: string]: unknown;
}

export const getLoginLogs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/login-log/list", { params });
export const getOperationLogs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/op-log/list", { params });
export const getOnlineUsers = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/online/list", { params });

export const getServerMetrics = () => client.get<MetricResp>("/api/v1/monitor/server");
export const getCacheMetrics = () => client.get<MetricResp>("/api/v1/monitor/cache");
export const getDatasourceMetrics = () => client.get<MetricResp>("/api/v1/monitor/datasource");
export const getCronJobs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/monitor/cron/list", { params });

export const getDictTypes = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/dict/type/list", { params });
export const getDictData = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/dict/data/list", { params });
export const getParams = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/params/list", { params });
export const getFiles = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/files/list", { params });
export const getNotices = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/notices/list", { params });

export const getCodegenList = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/devtools/codegen/list", { params });
export const getApiDocInfo = () => client.get<MetricResp>("/api/v1/devtools/api-doc/info");
export const getSqlStatus = () => client.get<MetricResp>("/api/v1/devtools/sql/status");
