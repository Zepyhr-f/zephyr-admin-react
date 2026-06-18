import client from "./client";

export interface DeptVO {
    id: string;
    code: string;
    parentCode?: string;
    leaf: number;
    deptName: string;
    orderNum: number;
    status: number;
    createTime: string;
    children?: DeptVO[];
}

export interface DeptForm {
    id?: string;
    code: string;
    parentCode?: string;
    deptName: string;
    orderNum: number;
    status?: number;
}

// 获取部门树
export const getDeptTree = () => {
    return client.get<DeptVO[]>("/zephyr-system/dept/tree");
};

// 新增部门
export const saveDept = (data: DeptForm) => {
    return client.post<boolean>("/zephyr-system/dept/save", data);
};

// 修改部门
export const updateDept = (data: DeptForm) => {
    return client.post<boolean>("/zephyr-system/dept/update", data);
};

// 批量删除
export const removeDepts = (ids: string[]) => {
    return client.post<boolean>("/zephyr-system/dept/remove", ids);
};
