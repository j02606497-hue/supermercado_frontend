// Configuración centralizada del cliente HTTP para las peticiones a la API

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000"
});

export default api;
