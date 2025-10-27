import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './CrearHabitacion.css';

export default function CrearHabitacion() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const [formData, setFormData] = useState({
    tipo: "",
    estado: "disponible",
    precio: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

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
      await axios.post(`${API_BASE_URL}/habitaciones/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Habitacion creada exitosamente.");
      // Redirige al usuario a la lista de habitaciones después de un pequeño retraso
      setTimeout(() => {
        navigate('/habitaciones');
      }, 1500);
    } catch (err) {
      console.error("Error al crear la habitacion:", err);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al crear la habitacion. Verifique los datos e intentelo de nuevo.");
      }
    }
  };

  return (
    <div className="crear-habitacion-container">
      <div className="form-card">
        <h1 className="crear-habitacion-title">Crear Nueva Habitación</h1>
        
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
              placeholder="Ej: Sencilla, Doble, Suite"
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
              placeholder="Ej: 150.00"
              step="0.01"
              required
            />
          </div>
          <button type="submit" className="submit-button">Crear Habitación</button>
        </form>
        <button onClick={() => navigate('/habitaciones')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}