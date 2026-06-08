// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("tft-workspace-root");

if (rootElement) {
  createRoot(rootElement).render(
    <div className="tft-app">
      <App />
    </div>,
  );
}
