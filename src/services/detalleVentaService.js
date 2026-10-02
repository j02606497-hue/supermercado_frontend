// Servicio para manejar las operaciones relacionadas con los detalles de venta, incluyendo la creación, actualización y eliminación de registros de detalles de venta

import api from "../api/axios";

export const createDetalleVenta = (data) => api.post("/api/detalle-ventas", data);
export const updateDetalleVenta = (id, data) => api.put(`/api/detalle-ventas/${id}`, data);
export const deleteDetalleVenta = (id) => api.delete(`/api/detalle-ventas/${id}`);
