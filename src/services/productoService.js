// Servicio para manejar las operaciones relacionadas con los productos, incluyendo la obtención, creación, actualización y eliminación de registros de productos

import api from "../api/axios";

export const getProductos = () => api.get("/api/productos");
export const createProducto = (data) => api.post("/api/productos", data);
export const updateProducto = (id, data) => api.put(`/api/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/api/productos/${id}`);
