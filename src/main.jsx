import React from "react";
import './app.css';

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context-api/AuthContext";
import { CurrentUser } from "./context-api/ProfileContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CurrentUser>
          <AppRoutes />
        </CurrentUser>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);