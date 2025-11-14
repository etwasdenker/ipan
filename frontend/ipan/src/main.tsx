import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Разрешаем лабораторию в деве или при VITE_SANDBOX_ENABLED=1
const enableWorkbench =
  import.meta.env.MODE !== "production" || import.meta.env.VITE_SANDBOX_ENABLED === "1";

async function bootstrap() {
  // Если открыли /_lab — рендерим Workbench и выходим
  if (enableWorkbench && window.location.pathname.startsWith("/_lab")) {
    const { default: WorkbenchApp } = await import("@workbench/WorkbenchApp");
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <WorkbenchApp />
      </React.StrictMode>
    );
    return;
  }

  // Обычный запуск приложения
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
