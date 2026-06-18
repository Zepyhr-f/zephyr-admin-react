import React, { lazy, Suspense, useMemo } from 'react';
import { Route, Routes } from 'react-router';
import { Spin } from 'antd';
import { useAuthStore } from '@/store/use-auth-store';
import { PlaceholderPage } from '@/components/PlaceholderPage';
import { DashboardOverview } from '@/pages/dashboard/Overview'; // We keep Overview static as fallback

// import.meta.glob imports all tsx files under pages
const pageModules = import.meta.glob('../pages/**/*.tsx');

// Helper to lazily load a component based on the backend component string (e.g. "system/UserManagement")
function loadComponent(componentPath?: string) {
  if (!componentPath) return null;
  const match = pageModules[`../pages/${componentPath}.tsx`];
  if (match) {
    return lazy(async () => {
      const module: any = await match();
      if (module.default) {
        return { default: module.default };
      }
      // 如果没有 default 导出，则尝试拿第一个导出的函数组件（支持具名导出）
      const keys = Object.keys(module).filter(k => typeof module[k] === 'function' || typeof module[k] === 'object');
      if (keys.length > 0) {
        return { default: module[keys[0]] };
      }
      return module;
    });
  }
  return null;
}

export const DynamicRoutes: React.FC = () => {
  const menus = useAuthStore((state) => state.menus);

  const routeElements = useMemo(() => {
    const result: React.ReactNode[] = [];

    const flatten = (list: any[]) => {
      list.forEach((m) => {
        // Only map if component is specified (usually type 'C')
        if (m.component) {
          const LazyComp = loadComponent(m.component);
          if (LazyComp) {
            result.push(
              <Route
                key={m.path || m.id}
                path={m.path}
                element={
                  <Suspense
                    fallback={
                      <div style={{ padding: 50, textAlign: 'center' }}>
                        <Spin size="large" tip="Loading component..." />
                      </div>
                    }
                  >
                    <LazyComp />
                  </Suspense>
                }
              />
            );
          } else {
            // If component path is in DB but file doesn't exist yet, show Placeholder
            result.push(
              <Route
                key={m.path || m.id}
                path={m.path}
                element={<PlaceholderPage title={m.menuName || 'Under Construction'} />}
              />
            );
          }
        }
        if (m.children && m.children.length > 0) {
          flatten(m.children);
        }
      });
    };

    if (menus) {
      flatten(menus);
    }
    return result;
  }, [menus]);

  return (
    <Routes>
      {/* 根路径默认加载概览，或者重定向 */}
      <Route path="/" element={<DashboardOverview />} />
      {/* 动态渲染所有的菜单页面 */}
      {routeElements}
      {/* 兜底 404 */}
      <Route path="*" element={<PlaceholderPage title="404 页面未找到" />} />
    </Routes>
  );
};
