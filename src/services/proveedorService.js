// Servicio para manejar las operaciones relacionadas con los proveedores, incluyendo la obtención, creación, actualización y eliminación de registros de proveedores

import api from "../api/axios";

export const getProveedores = () => api.get("/api/proveedores");
export const createProveedor = (data) => api.post("/api/proveedores", data);
export const updateProveedor = (id, data) => api.put(`/api/proveedores/${id}`, data);
export const deleteProveedor = (id) => api.delete(`/api/proveedores/${id}`);
