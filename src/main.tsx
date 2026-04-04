import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ToastProvider } from "./components/ui/toast";
import { FABQuickAdd } from "./components/ui/FABQuickAdd";

// If your project uses ReactDOM.render, adjust accordingly. This uses the Vite + React 18 pattern.
const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
      {/* Global quick-add FAB (optional). Pass onAdd prop if you want to call your API:
          <FABQuickAdd onAdd={async (payload) => { await api.post('/products', payload) }} />
      */}
      <FABQuickAdd />
    </ToastProvider>
  </React.StrictMode>
);