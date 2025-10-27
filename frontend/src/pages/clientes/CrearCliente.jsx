import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Clientes.css';

export default function CrearCliente() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/clientes/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Cliente creado exitosamente.");
      setTimeout(() => {
        navigate('/clientes}');
      }, 1500);
    } catch (err) {
      console.error("Error al crear el cliente:", err);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al crear el cliente. Verifique los datos.");
      }
    }
  };

  return (
    <div className="crear-cliente-container">
      <div className="form-card">
        <h1 className="crear-cliente-title">Crear Nuevo Cliente</h1>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="documento">Documento</label>
            <input
              type="text"
              id="documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">Crear Cliente</button>
        </form>
        <button onClick={() => navigate('/clientes')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
