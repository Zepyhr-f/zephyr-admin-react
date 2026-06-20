import type { ReactNode } from "react";

interface PageShellProps {
  /** 页头主标题 */
  title?: string;
  /** 页头副标题 / 业务说明 */
  description?: string;
  /** 页头右侧操作槽位（如全局刷新） */
  extra?: ReactNode;
  /** 页面主体 */
  children?: ReactNode;
}

/**
 * 统一的页面外壳。
 *
 * 规范见: zephyr-admin-react/STYLE_GUIDE.md
 *      和 zephyr-docs/90-开发规范/06-管理后台UI规范.md
 */
export function PageShell({ title, description, extra, children }: PageShellProps) {
  const hasHeader = Boolean(title || description || extra);
  return (
    <div className="z-page">
      {hasHeader && (
        <div className="z-page__header">
          <div>
            {title && <h2 className="z-page__title">{title}</h2>}
            {description && <p className="z-page__desc">{description}</p>}
          </div>
          {extra && <div className="z-page__extra">{extra}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
