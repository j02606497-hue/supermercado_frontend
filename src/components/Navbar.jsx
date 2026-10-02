// Componente de navegación principal que centraliza el acceso a las diferentes secciones de la aplicación

import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/proveedores", label: "Proveedores" },
  { to: "/usuarios", label: "Usuarios" },
  { to: "/productos", label: "Productos" },
  { to: "/ventas", label: "Ventas" }
];

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-4">
        <NavLink className="navbar-brand" to="/proveedores">
          Supermercado
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <li className="nav-item" key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
