import client from "./client";

export interface MenuVO {
  id?: number;
  code: string;
  menuCode?: string;
  parentCode: string;
  menuName: string;
  menuType: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  orderNum: number;
  status?: number;
  createTime?: string;
  children?: MenuVO[];
}

export interface MenuForm {
  id?: number;
  code?: string;
  menuCode?: string;
  parentCode?: string;
  menuName: string;
  menuType: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  orderNum: number;
  status: number;
}

export const getMenuTree = () => client.get<{ list: MenuVO[] }>("/api/v1/system/menu/tree");
export const getMenuList = (params?: Record<string, unknown>) => client.get<{ records: MenuVO[]; total: number }>("/api/v1/system/menu/list", { params });
export const getMenuDetail = (code: string) => client.get<{ menu: MenuVO }>("/api/v1/system/menu/detail", { params: { code } });
export const saveMenu = (data: MenuForm) => client.post("/api/v1/system/menu/save", data);
export const updateMenu = (data: MenuForm) => client.post("/api/v1/system/menu/update", data);
export const submitMenu = (data: MenuForm) => data.id || data.code ? updateMenu(data) : saveMenu(data);
export const removeMenus = (ids: Array<number | string>) => client.post("/api/v1/system/menu/remove", { ids });
export const updateMenuStatus = (code: string, status: number) => client.post("/api/v1/system/menu/status", { code, status });
