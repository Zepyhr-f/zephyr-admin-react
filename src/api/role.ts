import client from "./client";

export interface RoleVO {
    id: string;
    code: string;
    roleName: string;
    roleSort: number;
    dataScope: number;
    status: number;
    remark: string;
    createTime: string;
}

export interface RoleForm {
    id?: string;
    code: string;
    roleName: string;
    orderNum: number;
    status?: number;
    remark?: string;
}

export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
}

export const getRolePage = (params: { current?: number; size?: number; roleName?: string; status?: number | string }) => {
    return client.get<PageResult<RoleVO>>("/api/v1/system/role/list", { params });
};

export const getRoleDetail = (code: string) => client.get("/api/v1/system/role/detail", { params: { code } });
export const getRoleMenuTree = (code: string) => client.get("/api/v1/system/role/menuTree", { params: { code } });
export const assignRoleMenus = (roleCode: string, menuCodes: string[]) => client.post("/api/v1/system/role/assignMenus", { roleCode, menuCodes });
export const updateRoleDataScope = (data: { roleCode: string; dataScope: string; deptCodes?: string[] }) => client.post("/api/v1/system/role/dataScope", data);
export const submitRole = (data: RoleForm) => client.post<boolean>("/api/v1/system/role/submit", data);
export const updateRoleStatus = (id: string, status: number) => client.post<boolean>("/api/v1/system/role/updateStatus", { id, status });
export const removeRoles = (ids: string[]) => client.post<boolean>("/api/v1/system/role/remove", { ids });
