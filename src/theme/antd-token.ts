import type { ThemeConfig } from "antd";

/**
 * Ant Design 5/6 Theme Token 覆盖
 * 与 CSS 变量保持一致，实现组件库与自定义样式的同步
 */
export const antdLightToken: ThemeConfig = {
  token: {
    colorPrimary: "hsl(220, 94%, 56%)",
    colorSuccess: "hsl(150, 70%, 48%)",
    colorWarning: "hsl(45, 100%, 51%)",
    colorError: "hsl(0, 78%, 55%)",
    colorInfo: "hsl(210, 90%, 55%)",

    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    colorBgBase: "hsl(0, 0%, 98%)",
    colorBgContainer: "hsl(0, 0%, 100%)",
    colorBgElevated: "hsl(0, 0%, 100%)",
    colorBgLayout: "hsl(220, 20%, 96%)",
    colorBgMask: "rgba(0, 0, 0, 0.45)",

    colorTextBase: "hsl(0, 0%, 10%)",
    colorText: "hsl(0, 0%, 10%)",
    colorTextSecondary: "hsl(0, 0%, 40%)",
    colorTextTertiary: "hsl(0, 0%, 55%)",

    colorBorder: "hsl(220, 13%, 88%)",
    colorBorderSecondary: "hsl(220, 13%, 93%)",
    colorSplit: "hsl(220, 13%, 91%)",

    fontFamily:
      '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    boxShadow:
      "0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)",
    boxShadowSecondary:
      "0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.04)",
    boxShadowTertiary:
      "0 12px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)",
  },
  components: {
    Layout: {
      headerBg: "hsl(0, 0%, 100%)",
      headerColor: "hsl(0, 0%, 10%)",
      siderBg: "hsl(0, 0%, 100%)",
      triggerBg: "hsl(0, 0%, 100%)",
      triggerColor: "hsl(0, 0%, 40%)",
      bodyBg: "hsl(220, 20%, 96%)",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "hsl(220, 94%, 96%)",
      itemSelectedColor: "hsl(220, 94%, 56%)",
      itemHoverBg: "hsl(220, 20%, 96%)",
      itemHoverColor: "hsl(220, 94%, 56%)",
      subMenuItemBg: "transparent",
      groupTitleColor: "hsl(0, 0%, 55%)",
    },
    Table: {
      headerBg: "hsl(220, 20%, 96%)",
      headerColor: "hsl(0, 0%, 10%)",
      rowHoverBg: "hsl(220, 20%, 96%)",
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)",
    },
  },
};
