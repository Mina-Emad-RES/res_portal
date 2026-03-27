import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import Dashboard from "./pages/users/dashboard";
import { useEffect } from "react";
import { Toaster, toaster } from "./components/ui/toaster";
import { Button } from "@chakra-ui/react";
import { useColorMode } from "./components/ui/color-mode";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminPanel } from "./pages/admin/adminPanel";
import { SetPassword } from "./pages/auth/setPassword";
import { RequireAuth } from "./context/RequireAuth";
import { RequireAdmin } from "./context/RequireAdmin";
import Home from "./pages/client/home";
import { RoleRedirect } from "./context/RoleRedirect";
import { RequireClient } from "./context/RequireClient";
import { RequireStaff } from "./context/RequireStaff";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const handler = (event: CustomEvent<string>) => {
      toaster.create({
        title: "Error",
        description: event.detail,
        type: "error",
        duration: 5000,
      });
    };

    window.addEventListener("global:error", handler as EventListener);
    return () =>
      window.removeEventListener("global:error", handler as EventListener);
  }, []);

  return (
    <>
      <Toaster />
      <Button
        position="fixed"
        bottom="4"
        left="4"
        size="sm"
        onClick={toggleColorMode}
        zIndex={1000}
      >
        Toggle {colorMode === "light" ? "Dark" : "Light"}
      </Button>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <RoleRedirect />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireStaff>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </RequireStaff>
            </RequireAuth>
          }
        />

        <Route
          path="/home"
          element={
            <RequireAuth>
              <RequireClient>
                <AppLayout>
                  <Home />
                </AppLayout>
              </RequireClient>
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AppLayout>
                  <AdminPanel />
                </AppLayout>
              </RequireAdmin>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
