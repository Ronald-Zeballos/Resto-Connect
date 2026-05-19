import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./lib/auth";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Menu } from "./pages/Menu";
import { Mesas } from "./pages/Mesas";
import { Cocina, Pedidos } from "./pages/Pedidos";
import { Compras, Configuracion, Incidencias, Inventario, Pagos, Reportes } from "./pages/Operaciones";

function Guard() {
  const token = useAuth((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Guard />}>
        <Route index element={<Dashboard />} />
        <Route path="/mesas" element={<Mesas />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/cocina" element={<Cocina />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/incidencias" element={<Incidencias />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  );
}
