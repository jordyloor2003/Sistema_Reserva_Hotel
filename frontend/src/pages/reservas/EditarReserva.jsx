import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './Reservas.css';

export default function EditarReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cliente: "",
    habitacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: ""
  });
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchReserva = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No hay token de autenticacion.");
        setLoading(false);
        return;
      }
      try {
        const [reservaResponse, clientesResponse, habitacionesResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/reservas/${id}/`, { headers: { 'Authorization': `Token ${token}` } }),
          axios.get("http://127.0.0.1:8000/api/clientes/", { headers: { 'Authorization': `Token ${token}` } }),
          axios.get("http://127.0.0.1:8000/api/habitaciones/", { headers: { 'Authorization': `Token ${token}` } }),
        ]);

        const reservaData = reservaResponse.data;
        setFormData({
          cliente: reservaData.cliente,
          habitacion: reservaData.habitacion,
          fecha_inicio: reservaData.fecha_inicio,
          fecha_fin: reservaData.fecha_fin,
          estado: reservaData.estado
        });
        setClientes(clientesResponse.data);
        setHabitaciones(habitacionesResponse.data);
      } catch (err) {
        console.error("Error al obtener la reserva:", err);
        setError("No se pudo cargar la reserva. Intentelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchReserva();
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
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/reservas/${id}/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Reserva actualizada exitosamente.");
      setTimeout(() => {
        navigate('/reservas');
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar la reserva:", err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al actualizar la reserva. Verifique los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="editar-reserva-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando datos de la reserva...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-reserva-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button onClick={() => navigate('/reservas')} className="back-button">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-reserva-container">
      <div className="form-card">
        <h1 className="editar-reserva-title">Editar Reserva #{id}</h1>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cliente">Cliente</label>
            <select
              id="cliente"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="habitacion">Habitación</label>
            <select
              id="habitacion"
              name="habitacion"
              value={formData.habitacion}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una habitación</option>
              {habitaciones.map(habitacion => (
                <option key={habitacion.id} value={habitacion.id}>Habitación {habitacion.id} - {habitacion.tipo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fecha_inicio">Fecha de inicio</label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fecha_fin">Fecha de fin</label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
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
              <option value="pendiente">Pendiente</option>
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <button type="submit" className="submit-button">Guardar Cambios</button>
        </form>
        <button onClick={() => navigate('/reservas')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
