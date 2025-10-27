import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './Clientes.css';

export default function EditarCliente() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    documento: "",
    email: "",
    telefono: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No hay token de autenticacion.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/clientes/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setFormData(response.data);
      } catch (err) {
        console.error("Error al obtener el cliente:", err);
        setError("No se pudo cargar el cliente. Intentelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [id]);

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
      await axios.put(`${API_BASE_URL}/clientes/${id}/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Cliente actualizado exitosamente.");
      setTimeout(() => {
        navigate(`${API_BASE_URL}/clientes`);
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar el cliente:", err);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al actualizar el cliente. Verifique los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="editar-cliente-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando datos del cliente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-cliente-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button onClick={() => navigate(`${API_BASE_URL}/clientes`)} className="back-button">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-cliente-container">
      <div className="form-card">
        <h1 className="editar-cliente-title">Editar Cliente #{id}</h1>
        
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
          <button type="submit" className="submit-button">Guardar Cambios</button>
        </form>
        <button onClick={() => navigate(`${API_BASE_URL}/clientes`)} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
