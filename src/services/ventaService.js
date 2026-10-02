// Servicio para manejar las operaciones relacionadas con las ventas, incluyendo la obtención, creación, actualización y eliminación de registros de ventas

import api from "../api/axios";

export const getVentas = () => api.get("/api/ventas");
export const createVenta = (data) => api.post("/api/ventas", data);
export const updateVenta = (id, data) => api.put(`/api/ventas/${id}`, data);
export const deleteVenta = (id) => api.delete(`/api/ventas/${id}`);
