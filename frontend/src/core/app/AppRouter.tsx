import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../layout/AppShell";
import { useSession } from "../auth/sessionStore";
import { moduleRegistry } from "../modules/moduleRegistry";
import { LoginPage } from "../../modules/auth/interface/LoginPage";
import { QrMenuPage } from "../../modules/qr-menu/interface/QrMenuPage";

function Guard() {
  const token = useSession((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <AppShell />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/qr/:codigoQr" element={<QrMenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Guard />}>
        {moduleRegistry.map((module) => (
          module.path === "/" ? (
            <Route key={module.id} index element={<Suspense fallback={<RouteSkeleton />}><module.component /></Suspense>} />
          ) : (
            <Route key={module.id} path={module.path.slice(1)} element={<Suspense fallback={<RouteSkeleton />}><module.component /></Suspense>} />
          )
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function RouteSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-3xl bg-white shadow-soft" />
        <div className="h-36 animate-pulse rounded-3xl bg-white shadow-soft" />
        <div className="h-36 animate-pulse rounded-3xl bg-white shadow-soft" />
      </div>
    </div>
  );
}
