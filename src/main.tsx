import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@/theme/css-variables.css";
import "@/global.css";
import "./index.css";
import "@/locales/i18n";
import App from "./App.tsx";

async function prepareApp() {
  try {
    const isDevelopment = import.meta.env.DEV;
    const isMockEnabled = import.meta.env.VITE_ENABLE_MOCK === "true";

    if (isDevelopment && isMockEnabled) {
      const { worker } = await import("./_mock/browser");
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });
    }
  } catch (error) {
    console.error("MSW initialization failed:", error);
  }
  return Promise.resolve();
}

prepareApp().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
});
