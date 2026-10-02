// Importaciones de React y componentes necesarios para la página de usuarios, incluyendo el modal para el formulario y los servicios para interactuar con la API de usuarios

import { useEffect, useState } from "react";
import ModalForm from "../components/ModalForm";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
  updateUsuario
} from "../services/usuarioService";

// Estado inicial del formulario de usuario, utilizado para crear o editar un usuario 

const initialForm = {
  name: "",
  email: "",
  role: "vendedor"
};

// Componente de la página de usuarios que maneja la visualización, creación, edición y eliminación de usuarios, utilizando un modal para el formulario de entrada 

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const usuariosOrdenados = [...usuarios].sort((a, b) => Number(a.id) - Number(b.id));

// Función para obtener la lista de usuarios desde la API y actualizar el estado del componente, manejando errores en caso de fallo

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los usuarios.");
    }
  };

// Efecto que se ejecuta al montar el componente, llamando a la función para obtener los usuarios desde la API

  useEffect(() => {
    fetchUsuarios();
  }, []);

// Función para resetear el formulario, estableciendo los valores iniciales y limpiando el estado de edición y errores

  const resetForm = () => {
    setForm(initialForm);
    setSelectedId(null);
    setIsEditing(false);
    setError("");
  };

// Función para abrir el modal de creación, reseteando el formulario y estableciendo el estado del modal a abierto

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

// Función para abrir el modal de edición, llenando el formulario con los datos del usuario seleccionado y estableciendo el estado de edición a verdadero

  const openEditModal = (usuario) => {
    setForm({
      name: usuario.name,
      email: usuario.email,
      role: usuario.role
    });
    setSelectedId(usuario.id);
    setIsEditing(true);
    setError("");
    setModalOpen(true);
  };

// Función para manejar los cambios en los campos del formulario, actualizando el estado del formulario en consecuencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

// Función para manejar el envío del formulario, ya sea para crear un nuevo usuario o actualizar uno existente, con validaciones básicas y manejo de errores

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

// Validación básica del email para asegurar que el formato sea correcto

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("El email no es válido.");
      return;
    }

    if (!form.role.trim()) {
      setError("El rol es obligatorio.");
      return;
    }

// Construcción del payload para enviar a la API, asegurando que solo se envíen los campos necesarios

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role
    };

    try {
      setLoading(true);
      if (isEditing && selectedId) {
        await updateUsuario(selectedId, payload);
      } else {
        await createUsuario(payload);
      }
      setModalOpen(false);
      resetForm();
      await fetchUsuarios();
    } catch (err) {
      const message = err.response?.data?.error || "No se pudo guardar el usuario.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

// Función para manejar la eliminación de un usuario, mostrando una confirmación antes de proceder y actualizando la lista de usuarios tras la eliminación

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este usuario?")) {
      return;
    }

    try {
      await deleteUsuario(id);
      await fetchUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar el usuario.");
    }
  };

// Renderizado del componente de la pagina de Usuarios, incluyendo la tabla de usuarios y el modal para crear/editar usuarios

  return (
    <>
      <div className="page-header">
        <h2 className="mb-0">Usuarios</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Crear usuario
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {usuariosOrdenados.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.name}</td>
                <td>{usuario.email}</td>
                <td>{usuario.role}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEditModal(usuario)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(usuario.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalForm
        show={modalOpen}
        title={isEditing ? "Editar usuario" : "Crear usuario"}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="vendedor">vendedor</option>
            </select>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear usuario"}
            </button>
          </div>
        </form>
      </ModalForm>
    </>
  );
}
