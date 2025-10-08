import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css"; // AntD styles reset (AntD v5+)
import "./index.css"; // Your own global CSS if any
import Dashboard from "./Dashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
