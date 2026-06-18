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

// 分页查询角色列表
export const getRolePage = (params: { current?: number; size?: number; roleName?: string; status?: number | string }) => {
    return client.get<PageResult<RoleVO>>("/zephyr-system/role/list", { params });
};

// 新增或修改角色
export const submitRole = (data: RoleForm) => {
    return client.post<boolean>("/zephyr-system/role/submit", data);
};

// 更新状态
export const updateRoleStatus = (id: string, status: number) => {
    return client.post<boolean>("/zephyr-system/role/updateStatus", { id, status });
};

// 批量删除
export const removeRoles = (ids: string[]) => {
    return client.post<boolean>("/zephyr-system/role/remove", ids);
};
