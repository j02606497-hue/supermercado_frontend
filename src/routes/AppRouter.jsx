// Componente de enrutamiento principal de la aplicación que define las rutas y sus componentes asociados

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ProveedoresPage from "../pages/ProveedoresPage";
import UsuariosPage from "../pages/UsuariosPage";
import ProductosPage from "../pages/ProductosPage";
import VentasPage from "../pages/VentasPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><ProveedoresPage /></Layout>} />
        <Route path="/proveedores" element={<Layout><ProveedoresPage /></Layout>} />
        <Route path="/usuarios" element={<Layout><UsuariosPage /></Layout>} />
        <Route path="/productos" element={<Layout><ProductosPage /></Layout>} />
        <Route path="/ventas" element={<Layout><VentasPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
