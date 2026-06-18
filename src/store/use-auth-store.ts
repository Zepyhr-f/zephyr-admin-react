import { create } from "zustand";

interface UserInfo {
    userCode: string;
    username: string;
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: UserInfo | null;
    roles: string[];
    permissions: string[];
    menus: MenuItem[] | null;

    setToken: (token: string) => void;
    setUserInfo: (user: UserInfo, roles: string[], permissions: string[]) => void;
    setMenus: (menus: MenuItem[]) => void;
    clearAuth: () => void;
    logout: () => void;
}

export interface MenuItem {
    path: string;
    component?: string;
    name?: string;
    meta?: {
        title?: string;
        icon?: string;
    };
    children?: MenuItem[];
}

// 完整的系统菜单配置 - 根据功能设计文档
export const defaultMenus: MenuItem[] = [
    {
        path: "/system",
        name: "系统管理",
        meta: { title: "系统管理", icon: "setting" },
        children: [
            {
                path: "/system/user",
                name: "用户管理",
                meta: { title: "用户管理", icon: "user" }
            },
            {
                path: "/system/dept",
                name: "部门管理",
                meta: { title: "部门管理", icon: "apartment" }
            },
            {
                path: "/system/post",
                name: "岗位管理",
                meta: { title: "岗位管理", icon: "idcard" }
            },
            {
                path: "/system/menu",
                name: "菜单管理",
                meta: { title: "菜单管理", icon: "menu" }
            },
            {
                path: "/system/role",
                name: "角色管理",
                meta: { title: "角色管理", icon: "team" }
            }
        ]
    },
    {
        path: "/audit",
        name: "安全审计",
        meta: { title: "安全审计", icon: "safety" },
        children: [
            {
                path: "/audit/loginlog",
                name: "登录日志",
                meta: { title: "登录日志", icon: "login" }
            },
            {
                path: "/audit/operlog",
                name: "操作日志",
                meta: { title: "操作日志", icon: "profile" }
            },
            {
                path: "/audit/online",
                name: "在线用户",
                meta: { title: "在线用户", icon: "global" }
            }
        ]
    },
    {
        path: "/monitor",
        name: "系统监控",
        meta: { title: "系统监控", icon: "dashboard" },
        children: [
            {
                path: "/monitor/server",
                name: "服务监控",
                meta: { title: "服务监控", icon: "cloud-server" }
            },
            {
                path: "/monitor/cache",
                name: "缓存监控",
                meta: { title: "缓存监控", icon: "thunderbolt" }
            },
            {
                path: "/monitor/druid",
                name: "数据源监控",
                meta: { title: "数据源监控", icon: "database" }
            },
            {
                path: "/monitor/job",
                name: "任务调度",
                meta: { title: "任务调度", icon: "schedule" }
            }
        ]
    },
    {
        path: "/infra",
        name: "基础设施",
        meta: { title: "基础设施", icon: "build" },
        children: [
            {
                path: "/infra/dict",
                name: "字典管理",
                meta: { title: "字典管理", icon: "book" }
            },
            {
                path: "/infra/config",
                name: "参数配置",
                meta: { title: "参数配置", icon: "tool" }
            },
            {
                path: "/infra/file",
                name: "文件管理",
                meta: { title: "文件管理", icon: "folder" }
            },
            {
                path: "/infra/notice",
                name: "通知公告",
                meta: { title: "通知公告", icon: "notification" }
            }
        ]
    },
    {
        path: "/tool",
        name: "开发工具",
        meta: { title: "开发工具", icon: "code" },
        children: [
            {
                path: "/tool/gen",
                name: "代码生成",
                meta: { title: "代码生成", icon: "file-add" }
            },
            {
                path: "/tool/swagger",
                name: "接口文档",
                meta: { title: "接口文档", icon: "api" }
            },
            {
                path: "/tool/sql",
                name: "SQL 终端",
                meta: { title: "SQL 终端", icon: "console-sql" }
            }
        ]
    }
];

export const useAuthStore = create<AuthState>()((set) => ({
    token: null,
    isAuthenticated: false,
    user: null,
    roles: [],
    permissions: [],
    menus: defaultMenus,

    setToken: (token: string) => set({
        token,
        isAuthenticated: true,
    }),

    setUserInfo: (user: UserInfo, roles: string[], permissions: string[]) => set({
        user,
        roles,
        permissions,
    }),

    setMenus: (menus: MenuItem[]) => set({
        menus,
    }),

    clearAuth: () => set({
        token: null,
        isAuthenticated: false,
        user: null,
        roles: [],
        permissions: [],
        menus: null,
    }),

    logout: () => {
        set({
            token: null,
            isAuthenticated: false,
            user: null,
            roles: [],
            permissions: [],
            menus: defaultMenus,
        });
    },
}));
