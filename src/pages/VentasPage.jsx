// Importaciones de React y componentes necesarios para la página de ventas, incluyendo el modal para el formulario y los servicios para interactuar con la API de ventas, detalles de venta, productos y usuarios

import { useEffect, useState } from "react";
import ModalForm from "../components/ModalForm";
import { getProductos } from "../services/productoService";
import { getUsuarios } from "../services/usuarioService";
import {
  createDetalleVenta,
  deleteDetalleVenta,
  updateDetalleVenta
} from "../services/detalleVentaService";
import { createVenta, deleteVenta, getVentas, updateVenta } from "../services/ventaService";

// Estado inicial del detalle de venta, utilizado para crear o editar un detalle de venta asociado a una venta

const emptyDetail = { productId: "", quantity: 1 };

// Estado inicial del formulario de venta, utilizado para crear o editar una venta y sus detalles asociados

const getInitialForm = () => ({
  userId: "",
  detalles: [{ ...emptyDetail }]
});

// Componente de la página de ventas que maneja la visualización, creación, edición y eliminación de ventas y sus detalles asociados, utilizando un modal para el formulario de entrada

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [originalDetails, setOriginalDetails] = useState([]);
  const [form, setForm] = useState(getInitialForm());
  const ventasOrdenadas = [...ventas].sort((a, b) => Number(a.id) - Number(b.id));

// Función para obtener la lista de ventas desde la API y actualizar el estado del componente, manejando errores en caso de fallo

  const fetchVentas = async () => {
    try {
      const response = await getVentas();
      setVentas(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar las ventas.");
    }
  };

// Función para obtener la lista de usuarios desde la API y actualizar el estado del componente, manejando errores en caso de fallo

  const fetchUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los usuarios.");
    }
  };

// Función para obtener la lista de productos desde la API y actualizar el estado del componente, manejando errores en caso de fallo

  const fetchProductos = async () => {
    try {
      const response = await getProductos();
      setProductos(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudieron cargar los productos.");
    }
  };

// Efecto que se ejecuta al montar el componente, llamando a las funciones para obtener las ventas, usuarios y productos desde la API

  useEffect(() => {
    fetchVentas();
    fetchUsuarios();
    fetchProductos();
  }, []);

// Función para resetear el formulario, estableciendo los valores iniciales y limpiando el estado de edición, detalles originales y errores

  const resetForm = () => {
    setForm(getInitialForm());
    setSelectedId(null);
    setOriginalDetails([]);
    setIsEditing(false);
    setError("");
  };

// Función para abrir el modal de creación, reseteando el formulario y estableciendo el estado del modal a abierto

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

// Función para abrir el modal de edición, llenando el formulario con los datos de la venta seleccionada y sus detalles asociados, y estableciendo el estado de edición a verdadero

  const openEditModal = (venta) => {
    const details = venta.detalleVentas?.length
      ? venta.detalleVentas.map((detalle) => ({
          id: detalle.id,
          saleId: venta.id,
          productId: detalle.productId,
          quantity: detalle.quantity
        }))
      : [{ ...emptyDetail }];

    setForm({
      userId: venta.userId,
      detalles: details
    });
    setOriginalDetails(details);
    setSelectedId(venta.id);
    setIsEditing(true);
    setError("");
    setModalOpen(true);
  };

// Función para manejar los cambios en los campos del formulario, actualizando el estado del formulario en consecuencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

// Función para manejar los cambios en los detalles del formulario, actualizando el estado del formulario en consecuencia

  const handleDetailChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.map((detalle, detalleIndex) =>
        detalleIndex === index ? { ...detalle, [field]: value } : detalle
      )
    }));
  };

// Función para agregar un nuevo detalle de venta al formulario, inicializándolo con los valores del estado inicial del detalle y actualizando el estado del formulario en consecuencia

  const addDetail = () => {
    setForm((prev) => ({
      ...prev,
      detalles: [...prev.detalles, { ...emptyDetail }]
    }));
  };

// Función para eliminar un detalle de venta del formulario, asegurando que siempre haya al menos un detalle presente en el formulario y actualizando el estado del formulario en consecuencia

  const removeDetail = (index) => {
    setForm((prev) => ({
      ...prev,
      detalles: prev.detalles.filter((_, detalleIndex) => detalleIndex !== index)
    }));
  };

// Función para manejar el envío del formulario, validando los datos y llamando a la API para crear o actualizar una venta y sus detalles asociados, mostrando mensajes de error en caso de fallo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.userId || Number(form.userId) <= 0) {
      setError("Debe seleccionar un usuario válido.");
      return;
    }

    const detallesFormulario = (form.detalles || []).map((detalle) => ({
      ...detalle,
      productId: detalle?.productId ?? "",
      quantity: detalle?.quantity ?? 1
    }));

    if (!detallesFormulario.length) {
      setError("Debe agregar al menos un detalle de venta válido.");
      return;
    }

// Validación de los detalles del formulario para asegurar que cada producto exista y que la cantidad sea un número entero positivo, mostrando un mensaje de error en caso de que alguna validación falle

    const invalidDetail = detallesFormulario.some((detalle) => {
      const productId = Number(detalle.productId);
      const quantity = Number(detalle.quantity);

      return (
        !Number.isFinite(productId) ||
        productId <= 0 ||
        !Number.isFinite(quantity) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      );
    });

    if (invalidDetail) {
      setError("Cada producto debe existir y la cantidad debe ser un entero positivo.");
      return;
    }

// Creación del objeto detalles a partir de los datos del formulario, asegurando que los IDs de producto y las cantidades sean números

    const detalles = detallesFormulario.map((detalle) => ({
      ...detalle,
      productId: Number(detalle.productId),
      quantity: Number(detalle.quantity)
    }));

    try {
      setLoading(true);

      if (isEditing && selectedId) {
        await updateVenta(selectedId, { userId: Number(form.userId) });

// Manejo de los detalles de venta al editar una venta existente, comparando los detalles actuales con los originales para determinar cuáles se deben eliminar, actualizar o crear, y llamando a las funciones correspondientes de la API para realizar estas acciones

        const currentDetailIds = new Set(
          detalles.filter((detalle) => detalle.id).map((detalle) => Number(detalle.id))
        );

        const deletedIds = originalDetails
          .filter((detalle) => detalle.id && !currentDetailIds.has(Number(detalle.id)))
          .map((detalle) => detalle.id);

        for (const id of deletedIds) {
          await deleteDetalleVenta(id);
        }

        const originalDetailsById = new Map(
          originalDetails.map((detalle) => [Number(detalle.id), detalle])
        );

        for (const detalle of detalles) {
          const detallePayload = {
            saleId: Number(selectedId),
            productId: Number(detalle.productId),
            quantity: Number(detalle.quantity)
          };

          if (detalle.id) {
            const original = originalDetailsById.get(Number(detalle.id));
            const unchanged = original &&
              Number(original.productId) === detallePayload.productId &&
              Number(original.quantity) === detallePayload.quantity;

            if (!unchanged) {
              await updateDetalleVenta(detalle.id, detallePayload);
            }
          } else {
            await createDetalleVenta(detallePayload);
          }
        }
      } else {
        await createVenta({
          userId: Number(form.userId),
          detalles: detalles.map((detalle) => ({
            productId: Number(detalle.productId),
            quantity: Number(detalle.quantity)
          }))
        });
      }

      setModalOpen(false);
      resetForm();
      await fetchVentas();
    } catch (err) {
      const message = err.response?.data?.error || err.message || "No se pudo guardar la venta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

// Función para manejar la eliminación de una venta, mostrando una confirmación antes de proceder con la acción y llamando a la API para eliminar la venta correspondiente

  const handleDelete = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta venta?")) {
      return;
    }

    try {
      await deleteVenta(id);
      await fetchVentas();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo eliminar la venta.");
    }
  };

// Renderizado del componente de la pagina de Ventas, incluyendo la tabla de ventas y el modal para crear o editar una venta y sus detalles asociados

  return (
    <>
      <div className="page-header">
        <h2 className="mb-0">Ventas</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Crear venta
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped mb-0">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Detalles</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {ventasOrdenadas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.id}</td>
                <td>{venta.usuario?.name || venta.userId}</td>
                <td>{venta.date ? new Date(venta.date).toLocaleDateString() : "-"}</td>
                <td>$ {Number(venta.total).toLocaleString()}</td>
                <td>
                  {venta.detalleVentas?.map((detalle) => (
                    <div key={detalle.id || `${detalle.productId}-${detalle.quantity}`}>
                      {detalle.producto?.name || detalle.productId} x {detalle.quantity}
                    </div>
                  )) || "-"}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => openEditModal(venta)}
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(venta.id)}
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
        title={isEditing ? "Editar venta" : "Crear venta"}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <select
              className="form-select"
              name="userId"
              value={form.userId}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Detalles</label>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addDetail}>
                + Agregar detalle
              </button>
            </div>

            {form.detalles.map((detalle, index) => (
              <div key={`${index}-${detalle.productId || "nueva"}`} className="row g-2 mb-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">Producto</label>
                  <select
                    className="form-select"
                    value={detalle.productId}
                    onChange={(e) => handleDetailChange(index, "productId", e.target.value)}
                  >
                    <option value="">Seleccione</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={detalle.quantity}
                    onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeDetail(index)}
                    disabled={form.detalles.length === 1}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear venta"}
            </button>
          </div>
        </form>
      </ModalForm>
    </>
  );
}
