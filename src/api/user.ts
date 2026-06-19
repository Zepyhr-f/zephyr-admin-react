import client from "./client";

export interface UserVO {
    id: string;
    code: string;
    deptId: string;
    username: string;
    realName: string;
    email: string;
    phone: string;
    sex: number;
    status: number;
    deptName: string;
    avatar: string;
    roleCodes: string[];
    createTime: string;
}

export interface UserForm {
    id?: string;
    code?: string;
    nickName: string;
    realName: string;
    deptCode: string;
    phone?: string;
    email?: string;
    status?: number;
    sex?: number;
}

export const getUserList = (params: { username?: string; phone?: string; status?: number; deptCode?: string }) => {
    return client.get<{ list: UserVO[] }>("/api/v1/system/user/list", { params });
};

export const submitUser = (data: UserForm) => client.post<boolean>("/api/v1/system/user/submit", data);
export const updateUserStatus = (id: string, status: number) => client.post<boolean>("/api/v1/system/user/updateStatus", { id, status });
export const resetUserPassword = (id: string) => client.post<boolean>("/api/v1/system/user/resetPassword", { id });
export const removeUsers = (ids: string[]) => client.post<boolean>("/api/v1/system/user/remove", { ids });
