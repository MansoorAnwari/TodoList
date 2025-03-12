import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App"; // این باید به .tsx تغییر یابد اگر App فایل TypeScript است
import "./styles/main.scss";
import React from "react";

const root = createRoot(document.getElementById("root")!); // اطمینان از وجود عنصر root

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
