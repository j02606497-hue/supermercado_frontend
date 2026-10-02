// Importaciones de React y componentes necesarios para la página de productos, incluyendo el modal para el formulario y los servicios para interactuar con la API de productos y proveedores

import { useEffect, useState } from "react";
import ModalForm from "../components/ModalForm";
import { getProveedores } from "../services/proveedorService";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto
} from "../services/productoService";

// Estado inicial del formulario de producto, utilizado para crear o editar un producto

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  providerId: ""
};

// Componente de la página de productos que maneja la visualización, creación, edición y eliminación de productos, utilizando un modal para el formulario de entrada

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const productosOrdenados = [...productos].sort((a, b) => Number(a.id) - Number(b.id));
  const proveedoresOrdenados = [...proveedores].sort((a, b) => Number(a.id) - Number(b.id));

// Función para cargar los productos desde la API, actualizando el estado de productos y manejando errores en caso de fallo

  const fetchProductos = async () => {
    try {
      const response = await getProductos();
      setProductos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los productos.");
    }
  };

// Función para cargar los proveedores desde la API, actualizando el estado de proveedores y manejando errores en caso de fallo

  const fetchProveedores = async () => {
    try {
      const response = await getProveedores();
      setProveedores(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los proveedores.");
    }
  };

// Efecto que se ejecuta al montar el componente, llamando a las funciones para obtener los productos y proveedores desde la API

  useEffect(() => {
    fetchProductos();
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

// Función para abrir el modal de edición, llenando el formulario con los datos del producto seleccionado y estableciendo el estado de edición a verdadero 

  const openEditModal = (producto) => {
    setForm({
      name: producto.name,
      description: producto.description,
      price: producto.price,
      stock: producto.stock,
      providerId: producto.providerId
    });
    setSelectedId(producto.id);
    setIsEditing(true);
    setError("");
    setModalOpen(true);
  };

// Función para manejar los cambios en los campos del formulario, actualizando el estado del formulario en consecuencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

// Función para manejar el envío del formulario, validando los campos y llamando a la API para crear o actualizar un producto según corresponda, manejando errores en caso de fallo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (Number(form.price) <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    if (Number(form.stock) < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    if (!form.providerId || Number(form.providerId) <= 0) {
      setError("Debe seleccionar un proveedor válido.");
      return;
    }

// Construcción del payload para la creación o actualización del producto, asegurando que los valores numéricos sean convertidos correctamente

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      providerId: Number(form.providerId)
    };

    try {
      setLoading(true);
      if (isEditing && selectedId) {
        await updateProducto(selectedId, payload);
      } else {
        await createProducto(payload);
      }
      setModalOpen(false);
      resetForm();
      await fetchProductos();
    } catch (err) {
      const message = err.response?.data?.error || "No se pudo guardar el producto.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la eliminación de un producto, mostrando una confirmación antes de proceder y actualizando la lista de productos tras la eliminación

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar este producto?")) {
      return;
    }

    try {
      await deleteProducto(id);
      await fetchProductos();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar el producto.");
    }
  };

// Renderizado del componente de la pagina de Productos, incluyendo la tabla de productos y el modal para crear o editar productos

  return (
    <>
      <div className="page-header">
        <h2 className="mb-0">Productos</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Crear producto
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {productosOrdenados.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>{producto.name}</td>
                <td>{producto.description}</td>
                <td>$ {Number(producto.price).toLocaleString()}</td>
                <td>{producto.stock}</td>
                <td>{producto.proveedor?.name || producto.providerId}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEditModal(producto)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(producto.id)}
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
        title={isEditing ? "Editar producto" : "Crear producto"}
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
            <label className="form-label">Descripción</label>
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Precio</label>
              <input
                type="number"
                className="form-control"
                name="price"
                min="0"
                step="any"
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Stock</label>
              <input
                type="number"
                className="form-control"
                name="stock"
                min="0"
                step="1"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Proveedor</label>
              <select
                className="form-select"
                name="providerId"
                value={form.providerId}
                onChange={handleChange}
              >
                <option value="">Seleccione</option>
                {proveedoresOrdenados.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
            </button>
          </div>
        </form>
      </ModalForm>
    </>
  );
}
