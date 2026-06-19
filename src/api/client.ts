import axios, {type AxiosInstance, type InternalAxiosRequestConfig} from "axios";
import {useAuthStore} from "../store/use-auth-store.ts";
import {message, notification} from "antd";

const normalizeBaseURL = (baseURL?: string) => {
    if (!baseURL) return "";
    return baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
};

export const apiBaseURL = normalizeBaseURL(import.meta.env.VITE_API_BASE_URL);

interface ApiClient extends AxiosInstance {
    get<T = unknown>(url: string, config?: Parameters<AxiosInstance["get"]>[1]): Promise<T>;
    post<T = unknown>(url: string, data?: unknown, config?: Parameters<AxiosInstance["post"]>[2]): Promise<T>;
    put<T = unknown>(url: string, data?: unknown, config?: Parameters<AxiosInstance["put"]>[2]): Promise<T>;
    delete<T = unknown>(url: string, config?: Parameters<AxiosInstance["delete"]>[1]): Promise<T>;
}

const client = axios.create({
    baseURL: apiBaseURL,
    timeout: 5000,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true, // 允许携带 Cookie（Refresh Token）
}) as ApiClient;

// 刷新锁机制
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig)=> {
        const { token } = useAuthStore.getState();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // 添加规范请求头
        config.headers['X-Request-Id'] = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        config.headers['X-Client-Type'] = 'web';
        return config;
    },
    (error) => Promise.reject(error),
);

client.interceptors.response.use(
    (response) => {
        const { data } = response;
        const { code, msg, data: payload } = data;

        if (code === 200) {
            return payload;
        }
        message.error(msg || `业务系统异常`);
        return Promise.reject(new Error(msg || 'Error'));
    },
    async (error) => {
        const { response, config: originalConfig } = error;

        if (response) {
            const { status, data } = response;
            const errorMsg = data?.msg || data?.message || '网络连接异常，请检查网络设置';

            if (status === 401) {
                // 刷新接口本身返回 401，直接退出
                if (originalConfig.url?.includes('/auth/refresh')) {
                    useAuthStore.getState().clearAuth();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        const refreshRes = await axios.post(
                            `${apiBaseURL}/api/v1/auth/refresh`,
                            {},
                            { withCredentials: true }
                        );
                        const newToken = refreshRes.data?.data?.token;
                        if (newToken) {
                            useAuthStore.getState().setToken(newToken);
                            onRefreshed(newToken);
                            isRefreshing = false;

                            // 重放原请求
                            if (originalConfig.headers) {
                                originalConfig.headers.Authorization = `Bearer ${newToken}`;
                            }
                            return client(originalConfig);
                        }
                    } catch (refreshError) {
                        isRefreshing = false;
                        refreshSubscribers = [];
                        useAuthStore.getState().clearAuth();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                // 正在刷新中，加入队列等待
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken: string) => {
                        if (originalConfig.headers) {
                            originalConfig.headers.Authorization = `Bearer ${newToken}`;
                        }
                        resolve(client(originalConfig));
                    });
                });
            } else if (status === 403) {
                notification.error({ message: '无权访问', description: errorMsg });
            } else if (status === 500) {
                notification.error({ message: '服务器错误', description: '后台服务开小差了，请稍后再试' });
            } else {
                message.error(errorMsg);
            }
        } else {
            message.error('网络连接异常，请检查网络设置');
        }

        return Promise.reject(error);
    }
);

export default client;
