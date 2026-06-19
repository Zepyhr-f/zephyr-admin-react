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

export const getDeptTree = () => client.get<{ list: DeptVO[] }>("/api/v1/system/dept/tree");
export const saveDept = (data: DeptForm) => client.post<boolean>("/api/v1/system/dept/save", data);
export const updateDept = (data: DeptForm) => client.post<boolean>("/api/v1/system/dept/update", data);
export const removeDepts = (ids: string[]) => client.post<boolean>("/api/v1/system/dept/remove", { ids });
