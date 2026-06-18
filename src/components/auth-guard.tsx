import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/store/use-auth-store';
import { type ReactNode, useEffect, useState } from 'react';
import axios from 'axios';
import { Spin } from 'antd';

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const menus = useAuthStore((state) => state.menus);
    const setToken = useAuthStore((state) => state.setToken);
    const setUserInfo = useAuthStore((state) => state.setUserInfo);
    const setMenus = useAuthStore((state) => state.setMenus);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 已有认证状态且数据已加载
        if (isAuthenticated && user && menus) {
            setLoading(false);
            return;
        }

        // 有 token 但缺少用户数据（可能是页面刷新后 token 还在内存）
        if (token && (!user || !menus)) {
            loadUserData();
            return;
        }

        // 无 token，尝试静默刷新
        if (!token) {
            silentRefresh();
            return;
        }

        setLoading(false);
    }, []);

    const silentRefresh = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}zephyr-auth/auth/refresh`,
                {},
                { withCredentials: true }
            );
            const newToken = res.data?.data?.token;
            if (newToken) {
                setToken(newToken);
                await loadUserData(newToken);
            } else {
                setLoading(false);
            }
        } catch (e) {
            clearAuth();
            setLoading(false);
        }
    };

    const loadUserData = async (accessToken?: string) => {
        try {
            const headers: Record<string, string> = {};
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }
            const infoRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}zephyr-auth/info`, { headers, withCredentials: true });
            const infoData = infoRes.data?.data;
            if (infoData) {
                setUserInfo(infoData.user, infoData.roles, infoData.permissions);
            }
            
            const menuRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}zephyr-system/menu/tree`, { headers, withCredentials: true });
            const menuData = menuRes.data?.data?.list;
            setMenus(menuData || []);
        } catch (e) {
            console.error('加载用户信息失败:', e);
            clearAuth();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
