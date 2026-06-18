import type { ThemeConfig } from "antd";

/**
 * Ant Design 暗黑模式 Token
 */
export const antdDarkToken: ThemeConfig = {
  token: {
    colorPrimary: "hsl(217, 91%, 60%)",
    colorSuccess: "hsl(150, 60%, 55%)",
    colorWarning: "hsl(45, 90%, 55%)",
    colorError: "hsl(0, 75%, 60%)",
    colorInfo: "hsl(210, 85%, 60%)",

    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    colorBgBase: "hsl(220, 18%, 7%)",
    colorBgContainer: "hsl(220, 16%, 10%)",
    colorBgElevated: "hsl(220, 16%, 13%)",
    colorBgLayout: "hsl(220, 18%, 5%)",
    colorBgMask: "rgba(0, 0, 0, 0.65)",

    colorTextBase: "hsl(220, 15%, 92%)",
    colorText: "hsl(220, 15%, 92%)",
    colorTextSecondary: "hsl(220, 10%, 65%)",
    colorTextTertiary: "hsl(220, 10%, 50%)",

    colorBorder: "hsl(220, 12%, 22%)",
    colorBorderSecondary: "hsl(220, 12%, 18%)",
    colorSplit: "hsl(220, 12%, 20%)",

    fontFamily:
      '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    boxShadow:
      "0 1px 3px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.18)",
    boxShadowSecondary:
      "0 6px 16px rgba(0, 0, 0, 0.30), 0 3px 6px rgba(0, 0, 0, 0.20)",
    boxShadowTertiary:
      "0 12px 32px rgba(0, 0, 0, 0.40), 0 8px 16px rgba(0, 0, 0, 0.25)",
  },
  components: {
    Layout: {
      headerBg: "hsl(220, 16%, 10%)",
      headerColor: "hsl(220, 15%, 92%)",
      siderBg: "hsl(220, 16%, 10%)",
      triggerBg: "hsl(220, 16%, 10%)",
      triggerColor: "hsl(220, 10%, 65%)",
      bodyBg: "hsl(220, 18%, 5%)",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "hsl(217, 91%, 15%)",
      itemSelectedColor: "hsl(217, 91%, 60%)",
      itemHoverBg: "hsl(220, 12%, 18%)",
      itemHoverColor: "hsl(217, 91%, 60%)",
      subMenuItemBg: "transparent",
      groupTitleColor: "hsl(220, 10%, 50%)",
    },
    Table: {
      headerBg: "hsl(220, 16%, 13%)",
      headerColor: "hsl(220, 15%, 92%)",
      rowHoverBg: "hsl(220, 16%, 13%)",
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.18)",
    },
  },
};
