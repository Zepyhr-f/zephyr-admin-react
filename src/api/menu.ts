import client from "./client";

export interface MenuVO {
  id: number;
  code: string;
  parentCode: string;
  menuName: string;
  menuType: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  orderNum: number;
  status: number;
  createTime: string;
  children?: MenuVO[];
}

export interface MenuForm {
  id?: number;
  code?: string;
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

export const getMenuTree = () => {
  return client.get("/zephyr-system/menu/tree");
};

export const getMenuDetail = (id: number) => {
  return client.get(`/zephyr-system/menu/detail?id=${id}`);
};

export const saveMenu = (data: MenuForm) => {
  return client.post("/zephyr-system/menu/save", data);
};

export const updateMenu = (data: MenuForm) => {
  return client.post("/zephyr-system/menu/update", data);
};

export const submitMenu = (data: MenuForm) => {
  return client.post("/zephyr-system/menu/submit", data);
};

export const removeMenus = (ids: number[]) => {
  return client.post("/zephyr-system/menu/remove", ids);
};
