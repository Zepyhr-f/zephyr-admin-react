import { Routes, Route } from "react-router";
import { ConfigProvider, theme as antdTheme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useThemeStore } from "@/store/use-theme-store";
import { antdLightToken } from "@/theme/antd-token";
import { antdDarkToken } from "@/theme/dark-token";
import AdminLayout from "@/layouts/admin-layout";
import BlankLayout from "@/layouts/blank-layout";
import LoginPage from "@/pages/login";
import AuthGuard from "@/components/auth-guard";


function App() {
  const { isDark } = useThemeStore();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        ...(isDark ? antdDarkToken : antdLightToken),
        token: {
          ...(isDark ? antdDarkToken?.token : antdLightToken?.token),
          colorPrimary: "var(--z-primary)",
          colorInfo: "var(--z-primary)",
          colorWarning: "var(--z-accent)",
          borderRadius: 10,
        },
        components: {
          Layout: {
            bodyBg: "var(--z-bg)",
            headerBg: "var(--z-surface)",
            siderBg: "var(--z-surface)",
          },
          Menu: { 
            itemBorderRadius: 10,
            itemSelectedBg: "color-mix(in srgb, var(--z-button-hover) 15%, transparent)",
            itemSelectedColor: isDark ? "#ffffff" : "var(--z-primary)",
            itemHoverBg: "color-mix(in srgb, var(--z-button-hover) 6%, transparent)",
            itemHoverColor: isDark ? "#ffffff" : "var(--z-primary)",
          },
          Card: { borderRadiusLG: 14 },
          Button: {
            // 让所有的 primary 按钮和 link 按钮使用单独配置的“按钮颜色”
            colorPrimary: "var(--z-button-hover)",
            
            // 默认按钮：白底（暗黑模式下透明或深灰），悬浮变深色
            defaultBg: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
            defaultHoverBg: isDark ? "rgba(255,255,255,0.12)" : "#F1F5F9",
            defaultActiveBg: isDark ? "rgba(255,255,255,0.16)" : "#E2E8F0",
            defaultHoverBorderColor: isDark ? "#475569" : "#CBD5E1",
            defaultHoverColor: isDark ? "#E2E8F0" : "#334155",
            
            // 无底色按钮 (text/link)：悬浮浅色蓝，选中深色蓝 (避免使用 transparent 导致发黑，浅色模式直接混入白色)
            textHoverBg: isDark ? "rgba(255,255,255,0.06)" : "color-mix(in srgb, var(--z-button-hover) 10%, #ffffff)",
          },
        },
      }}
    >
      <Routes>
        {/* 登录页（空白布局） */}
        <Route element={<BlankLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* 后台管理布局（受保护） */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AdminLayout />
            </AuthGuard>
          }
        />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
