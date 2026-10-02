// Importaciones de React y componentes necesarios para la página de proveedores, incluyendo el modal para el formulario y los servicios para interactuar con la API de proveedores

import { useEffect, useState } from "react";
import ModalForm from "../components/ModalForm";
import {
  createProveedor,
  deleteProveedor,
  getProveedores,
  updateProveedor
} from "../services/proveedorService";

// Estado inicial del formulario de proveedor, utilizado para crear o editar un proveedor

const initialForm = {
  name: "",
  phone: "",
  email: "",
  city: ""
};

// Componente de la página de proveedores que maneja la visualización, creación, edición y eliminación de proveedores, utilizando un modal para el formulario de entrada

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const proveedoresOrdenados = [...proveedores].sort((a, b) => Number(a.id) - Number(b.id));

// Función para obtener la lista de proveedores desde la API y actualizar el estado del componente, manejando errores en caso de fallo

  const fetchProveedores = async () => {
    try {
      const response = await getProveedores();
      setProveedores(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los proveedores.");
    }
  };

// Efecto que se ejecuta al montar el componente, llamando a la función para obtener los proveedores desde la API

  useEffect(() => {
    fetchProveedores();
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

// Función para abrir el modal de edición, llenando el formulario con los datos del proveedor seleccionado

  const openEditModal = (proveedor) => {
    setForm({
      name: proveedor.name,
      phone: proveedor.phone,
      email: proveedor.email,
      city: proveedor.city
    });
    setSelectedId(proveedor.id);
    setIsEditing(true);
    setError("");
    setModalOpen(true);
  };

// Función para manejar los cambios en los campos del formulario, actualizando el estado del formulario en consecuencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

// Función para manejar el envío del formulario, validando que el nombre del proveedor no este vacio

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

// Datos del formulario que se envían a la API para crear o actualizar el proveedor

    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city
    };

    try {
      setLoading(true);
      if (isEditing && selectedId) {
        await updateProveedor(selectedId, payload);
      } else {
        await createProveedor(payload);
      }
      setModalOpen(false);
      resetForm();
      await fetchProveedores();
    } catch (err) {
      const message = err.response?.data?.error || "No se pudo guardar el proveedor.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

// Función para manejar la eliminación de un proveedor, mostrando una confirmación antes de proceder y actualizando la lista de proveedores después de la operación, manejando errores en caso de fallo

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este proveedor?")) {
      return;
    }

    try {
      await deleteProveedor(id);
      await fetchProveedores();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar el proveedor.");
    }
  };

// Renderizado del componente de la pagina de Proveedores, incluyendo la tabla de proveedores y el modal para crear o editar un proveedor
   
  return (
    <>
      <div className="page-header">
        <h2 className="mb-0">Proveedores</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Crear proveedor
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Ciudad</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresOrdenados.map((proveedor) => (
              <tr key={proveedor.id}>
                <td>{proveedor.id}</td>
                <td>{proveedor.name}</td>
                <td>{proveedor.phone}</td>
                <td>{proveedor.email}</td>
                <td>{proveedor.city}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEditModal(proveedor)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(proveedor.id)}
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
        title={isEditing ? "Editar proveedor" : "Crear proveedor"}
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

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Ciudad</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="text"
              className="form-control"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>


          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear proveedor"}
            </button>
          </div>
        </form>
      </ModalForm>
    </>
  );
}
