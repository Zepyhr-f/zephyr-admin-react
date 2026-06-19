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

export interface IdsReq {
  ids: string[];
}

export interface IdStatusReq {
  id: string;
  status: number;
}

export interface DictTypeSaveReq {
  id?: string;
  dictName: string;
  dictType: string;
  status?: number;
  remark?: string;
}

export interface DictDataSaveReq {
  id?: string;
  dictType: string;
  label: string;
  value: string;
  orderNum?: number;
  status?: number;
  remark?: string;
}

export interface ParamSaveReq {
  id?: string;
  key: string;
  value: string;
  sensitive?: boolean;
  category?: string;
  remark?: string;
  status?: number;
}

export interface NoticeSaveReq {
  id?: string;
  title: string;
  type?: string;
  content: string;
  status?: number;
}

export interface CronSaveReq {
  id?: string;
  name: string;
  group?: string;
  cron: string;
  handler: string;
  status?: number;
  description?: string;
}

export const getLoginLogs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/login-log/list", { params });
export const removeLoginLogs = (ids: string[]) => client.post<{ affected: number }>("/api/v1/security/login-log/remove", { ids });
export const clearLoginLogs = () => client.post<{ removed: number }>("/api/v1/security/login-log/clear");

export const getOperationLogs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/op-log/list", { params });
export const getOperationLogDetail = (id: string) => client.get<Record<string, unknown>>("/api/v1/security/op-log/detail", { params: { id } });
export const removeOperationLogs = (ids: string[]) => client.post<{ affected: number }>("/api/v1/security/op-log/remove", { ids });
export const clearOperationLogs = () => client.post<{ removed: number }>("/api/v1/security/op-log/clear");

export const getOnlineUsers = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/security/online/list", { params });
export const kickoutOnlineUsers = (ids: string[]) => client.post<{ affected: number }>("/api/v1/security/online/kickout", { ids });

export const getServerMetrics = () => client.get<MetricResp>("/api/v1/monitor/server");
export const getCacheMetrics = () => client.get<MetricResp>("/api/v1/monitor/cache");
export const getDatasourceMetrics = () => client.get<MetricResp>("/api/v1/monitor/datasource");

export const getCronJobs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/monitor/cron/list", { params });
export const getCronHandlers = () => client.get<Record<string, string>>("/api/v1/monitor/cron/handlers");
export const saveCronJob = (payload: CronSaveReq) => client.post<Record<string, unknown>>("/api/v1/monitor/cron/save", payload);
export const updateCronStatus = (payload: IdStatusReq) => client.post<void>("/api/v1/monitor/cron/status", payload);
export const removeCronJobs = (ids: string[]) => client.post<{ affected: number }>("/api/v1/monitor/cron/remove", { ids });
export const runCronJob = (id: string) => client.post<Record<string, unknown>>("/api/v1/monitor/cron/run", { id });
export const getCronLogs = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/monitor/cron/logs", { params });

export const getDictTypes = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/dict/type/list", { params });
export const saveDictType = (payload: DictTypeSaveReq) => client.post<Record<string, unknown>>("/api/v1/infrastructure/dict/type/save", payload);
export const removeDictTypes = (ids: string[]) => client.post<{ affected: number }>("/api/v1/infrastructure/dict/type/remove", { ids });
export const updateDictTypeStatus = (payload: IdStatusReq) => client.post<void>("/api/v1/infrastructure/dict/type/status", payload);
export const getDictData = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/dict/data/list", { params });
export const saveDictData = (payload: DictDataSaveReq) => client.post<Record<string, unknown>>("/api/v1/infrastructure/dict/data/save", payload);
export const removeDictData = (ids: string[]) => client.post<{ affected: number }>("/api/v1/infrastructure/dict/data/remove", { ids });
export const updateDictDataStatus = (payload: IdStatusReq) => client.post<void>("/api/v1/infrastructure/dict/data/status", payload);

export const getParams = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/params/list", { params });
export const saveParam = (payload: ParamSaveReq) => client.post<Record<string, unknown>>("/api/v1/infrastructure/params/save", payload);
export const removeParams = (ids: string[]) => client.post<{ affected: number }>("/api/v1/infrastructure/params/remove", { ids });
export const refreshParamsCache = () => client.post<Record<string, unknown>>("/api/v1/infrastructure/params/refresh-cache");

export const getFiles = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/files/list", { params });
export const uploadFile = (file: File, category?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (category) form.append("category", category);
  return client.post<Record<string, unknown>>("/api/v1/infrastructure/files/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
};
export const downloadFileUrl = (id: string) => `/api/v1/infrastructure/files/download?id=${encodeURIComponent(id)}`;
export const removeFiles = (ids: string[]) => client.post<{ affected: number }>("/api/v1/infrastructure/files/remove", { ids });

export const getNotices = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/infrastructure/notices/list", { params });
export const saveNotice = (payload: NoticeSaveReq) => client.post<Record<string, unknown>>("/api/v1/infrastructure/notices/save", payload);
export const removeNotices = (ids: string[]) => client.post<{ affected: number }>("/api/v1/infrastructure/notices/remove", { ids });
export const publishNotice = (id: string, publish = true) => client.post<void>("/api/v1/infrastructure/notices/publish", { id, publish });

export const getCodegenList = (params?: Record<string, unknown>) => client.get<AdminListResp>("/api/v1/devtools/codegen/list", { params });
export const previewCodegen = (tableName: string) => client.post<Record<string, unknown>>("/api/v1/devtools/codegen/preview", { tableName });
export const downloadCodegen = (tableName: string) => client.post<Record<string, unknown>>("/api/v1/devtools/codegen/download", { tableName });
export const getApiDocInfo = () => client.get<MetricResp>("/api/v1/devtools/api-doc/info");
export const getSqlStatus = () => client.get<MetricResp>("/api/v1/devtools/sql/status");
export const executeSql = (sql: string) => client.post<Record<string, unknown>>("/api/v1/devtools/sql/execute", { sql });
