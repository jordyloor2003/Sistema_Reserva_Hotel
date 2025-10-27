import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './EditarHabitacion.css';

export default function EditarHabitacion() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo: "",
    estado: "",
    precio: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchHabitacion = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No hay token de autenticacion.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/habitaciones/${id}/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        setFormData(response.data);
      } catch (err) {
        console.error("Error al obtener la habitación:", err);
        setError("No se pudo cargar la habitacion. Intentelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchHabitacion();
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
      await axios.put(`${API_BASE_URL}/habitaciones/${id}/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Habitacion actualizada exitosamente.");
      setTimeout(() => {
        navigate('/habitaciones');
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar la habitacion:", err);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al actualizar la habitacion. Verifique los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="editar-habitacion-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando datos de la habitación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-habitacion-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button onClick={() => navigate('/habitaciones')} className="back-button">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-habitacion-container">
      <div className="form-card">
        <h1 className="editar-habitacion-title">Editar Habitación #{id}</h1>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tipo">Tipo de Habitación</label>
            <input
              type="text"
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
            >
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
          <button type="submit" className="submit-button">Guardar Cambios</button>
        </form>
        <button onClick={() => navigate('/habitaciones')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}