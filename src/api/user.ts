import client from "./client";

export interface UserVO {
    id: string;
    code: string;
    deptId: string;
    username: string; // From backend's nickName
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
    nickName: string; // Sent as nickName instead of username to match backend User entity
    realName: string;
    deptCode: string;
    phone?: string;
    email?: string;
    status?: number;
    sex?: number;
}

// User List API
export const getUserList = (params: { username?: string; phone?: string; status?: number; deptCode?: string }) => {
    return client.get<UserVO[]>("/zephyr-system/user/list", { params });
};

// Add or Update User API
export const submitUser = (data: UserForm) => {
    return client.post<boolean>("/zephyr-system/user/submit", data);
};

// Update User Status
export const updateUserStatus = (id: string, status: number) => {
    return client.post<boolean>("/zephyr-system/user/updateStatus", { id, status });
};

// Reset Password
export const resetUserPassword = (id: string) => {
    return client.post<boolean>("/zephyr-system/user/resetPassword", { id });
};

// Delete User
export const removeUsers = (ids: string[]) => {
    return client.post<boolean>("/zephyr-system/user/remove", ids);
};
