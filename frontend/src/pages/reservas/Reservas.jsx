import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Reservas.css';

export default function Reservas() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    cliente: "",
    habitacion: ""
  });
  const navigate = useNavigate();

  // Función para obtener todas las reservas con o sin filtros
  const fetchReservas = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    try {
      // Construir la URL de los filtros dinámicamente
      const params = new URLSearchParams(filtros).toString();
      const response = await axios.get(`${API_BASE_URL}/reservas/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setReservas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener las reservas:", err);
      setError("Error al cargar las reservas. Por favor, intentelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener clientes y habitaciones para los select
  const fetchSelectData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const clientesResponse = await axios.get(`${API_BASE_URL}/clientes/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      setClientes(clientesResponse.data);

      const habitacionesResponse = await axios.get(`${API_BASE_URL}/habitaciones/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      setHabitaciones(habitacionesResponse.data);
    } catch (err) {
      console.error("Error al obtener datos para la informacion requerida:", err);
    }
  };

  useEffect(() => {
    fetchReservas();
    fetchSelectData();
  }, []);

  const handleCreateReserva = () => {
    navigate(`${API_BASE_URL}/crear-reserva`);
  };

  const handleEditReserva = (id) => {
    navigate(`${API_BASE_URL}/editar-reserva/${id}`);
  };

  const handleDeleteReserva = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/reservas/${reservaToDelete}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      fetchReservas();
      setShowConfirm(false);
      setReservaToDelete(null);
    } catch (err) {
      console.error("Error al eliminar la reserva:", err);
      setError("Error al eliminar la reserva. Podria tener un estado que impide la eliminacion.");
    }
  };

  const confirmDelete = (id) => {
    setReservaToDelete(id);
    setShowConfirm(true);
  };

  const handleCheckIn = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/reservas/${id}/checkin/`, null, {
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchReservas();
    } catch (err) {
      console.error("Error al hacer check-in:", err);
      setError("Error al hacer check-in. La reserva podria no estar pendiente.");
    }
  };

  const handleCheckOut = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/reservas/${id}/checkout/`, null, {
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchReservas();
    } catch (err) {
      console.error("Error al hacer check-out:", err);
      setError("Error al hacer check-out. La reserva podria no estar activa.");
    }
  };

  const resetFiltros = () => {
    setFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      estado: "",
      cliente: "",
      habitacion: ""
    });
    fetchReservas();
  };

  if (loading) {
    return (
      <div className="reservas-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando reservas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservas-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reservas-container">
      <div className="reservas-content">
        <div className="header-flex">
          <h1 className="reservas-title">Gestión de Reservas</h1>
          <button onClick={handleCreateReserva} className="create-button">
            Crear Nueva Reserva
          </button>
        </div>

        <div className="filtros-container">
          <input
            type="date"
            value={filtros.fecha_inicio}
            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
            placeholder="Fecha de inicio"
          />
          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
            placeholder="Fecha de fin"
          />
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="activa">Activa</option>
            <option value="finalizada">Finalizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <select
            value={filtros.cliente}
            onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
          >
            <option value="">Todos los clientes</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
            ))}
          </select>
          <select
            value={filtros.habitacion}
            onChange={(e) => setFiltros({ ...filtros, habitacion: e.target.value })}
          >
            <option value="">Todas las habitaciones</option>
            {habitaciones.map(habitacion => (
              <option key={habitacion.id} value={habitacion.id}>Habitación {habitacion.id} - {habitacion.tipo}</option>
            ))}
          </select>
          <button onClick={fetchReservas} className="search-button">
            Filtrar
          </button>
          <button onClick={resetFiltros} className="reset-button">
            Limpiar
          </button>
        </div>

        <div className="reservas-table-container">
          <table className="reservas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Habitación</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length > 0 ? (
                reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>{reserva.id}</td>
                    <td>{clientes.find(c => c.id === reserva.cliente)?.nombre || 'N/A'}</td>
                    <td>Hab. {habitaciones.find(h => h.id === reserva.habitacion)?.id || 'N/A'} - {habitaciones.find(h => h.id === reserva.habitacion)?.tipo || 'N/A'}</td>
                    <td>{reserva.fecha_inicio}</td>
                    <td>{reserva.fecha_fin}</td>
                    <td>
                      <span className={`estado-badge estado-${reserva.estado}`}>
                        {reserva.estado}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-reserva">
                        {reserva.estado === 'pendiente' && (
                          <button onClick={() => handleCheckIn(reserva.id)} className="checkin-button">
                            Check-in
                          </button>
                        )}
                        {reserva.estado === 'activa' && (
                          <button onClick={() => handleCheckOut(reserva.id)} className="checkout-button">
                            Check-out
                          </button>
                        )}
                        <button onClick={() => handleEditReserva(reserva.id)} className="edit-button">
                          Editar
                        </button>
                        <button onClick={() => confirmDelete(reserva.id)} className="delete-button">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-reservas-text">No se encontraron reservas con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de que quieres eliminar esta reserva?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteReserva} className="modal-confirm">Sí, eliminar</button>
              <button onClick={() => setShowConfirm(false)} className="modal-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
