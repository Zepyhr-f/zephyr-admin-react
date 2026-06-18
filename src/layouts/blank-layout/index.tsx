import { Outlet } from "react-router";

/**
 * 空白布局
 * 用于登录页、404 等不需要侧边栏/顶栏的页面
 */
export default function BlankLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      <Outlet />
    </div>
  );
}
