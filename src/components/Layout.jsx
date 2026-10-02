// Define la estructura general de las páginas, integrando la barra de navegación y el contenido principal

import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container-fluid px-4 py-4">{children}</main>
    </>
  );
}
