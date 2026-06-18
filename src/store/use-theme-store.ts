import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  primaryColor: string;
  darkPrimaryColor: string;
  buttonHoverColor: string;
  darkButtonHoverColor: string;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
  setButtonHoverColor: (color: string) => void;
}

function resolveDark(mode: ThemeMode): boolean {
  if (mode === "dark") return true;
  if (mode === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(isDark: boolean, primaryColor: string, buttonHoverColor: string) {
  const root = document.documentElement;
  if (isDark) {
    root.setAttribute("data-theme", "dark");
  } else {
    root.removeAttribute("data-theme");
  }
  root.style.setProperty("--z-primary", primaryColor);
  root.style.setProperty("--z-button-hover", buttonHoverColor);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      isDark: false,
      primaryColor: "#1E40AF",
      darkPrimaryColor: "#3B82F6",
      buttonHoverColor: "#1E40AF", // 暂存默认，实际可以独立配置
      darkButtonHoverColor: "#3B82F6",

      setMode: (mode) => {
        const isDark = resolveDark(mode);
        const pColor = isDark ? get().darkPrimaryColor : get().primaryColor;
        const bColor = isDark ? get().darkButtonHoverColor : get().buttonHoverColor;
        applyTheme(isDark, pColor, bColor);
        set({ mode, isDark });
      },

      toggleTheme: () => {
        const nextMode = get().isDark ? "light" : "dark";
        const isDark = resolveDark(nextMode);
        const pColor = isDark ? get().darkPrimaryColor : get().primaryColor;
        const bColor = isDark ? get().darkButtonHoverColor : get().buttonHoverColor;
        applyTheme(isDark, pColor, bColor);
        set({ mode: nextMode, isDark });
      },
      
      setPrimaryColor: (color) => {
        const isDark = get().isDark;
        if (isDark) {
          applyTheme(isDark, color, get().darkButtonHoverColor);
          set({ darkPrimaryColor: color });
        } else {
          applyTheme(isDark, color, get().buttonHoverColor);
          set({ primaryColor: color });
        }
      },

      setButtonHoverColor: (color) => {
        const isDark = get().isDark;
        if (isDark) {
          applyTheme(isDark, get().darkPrimaryColor, color);
          set({ darkButtonHoverColor: color });
        } else {
          applyTheme(isDark, get().primaryColor, color);
          set({ buttonHoverColor: color });
        }
      }
    }),
    {
      name: "zephyr-theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const isDark = resolveDark(state.mode);
          const pColor = isDark ? (state.darkPrimaryColor || "#3B82F6") : (state.primaryColor || "#1E40AF");
          const bColor = isDark ? (state.darkButtonHoverColor || "#3B82F6") : (state.buttonHoverColor || "#1E40AF");
          applyTheme(isDark, pColor, bColor);
          state.isDark = isDark;
          // Fallback init
          state.primaryColor = state.primaryColor || "#1E40AF";
          state.darkPrimaryColor = state.darkPrimaryColor || "#3B82F6";
          state.buttonHoverColor = state.buttonHoverColor || "#1E40AF";
          state.darkButtonHoverColor = state.darkButtonHoverColor || "#3B82F6";
        }
      },
    }
  )
);
