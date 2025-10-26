import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Habitaciones.css';

export default function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [habitacionToDelete, setHabitacionToDelete] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const navigate = useNavigate();

  // Función para obtener todas las habitaciones (la ruta por defecto)
  const fetchTodasHabitaciones = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/habitaciones/", {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setHabitaciones(response.data);
      setError(null);
      setFechaInicio("");
      setFechaFin("");
    } catch (err) {
      console.error("Error al obtener las habitaciones:", err);
      setError("Error al cargar las habitaciones. Por favor, intentelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar habitaciones disponibles por fechas
  const fetchHabitacionesDisponibles = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    if (!fechaInicio || !fechaFin) {
      setError("Por favor, selecciona una fecha de inicio y una de fin para buscar.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/habitaciones/disponibles/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      setHabitaciones(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al buscar habitaciones disponibles:", err);
      setError("Error al buscar habitaciones disponibles. Por favor, intentelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodasHabitaciones();
  }, []);

  const handleCreateRoom = () => {
    navigate('/crear-habitacion');
  };

  const handleEditRoom = (id) => {
    navigate(`/editar-habitacion/${id}`);
  };

  const handleDeleteRoom = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.delete(`http://127.0.0.1:8000/api/habitaciones/${habitacionToDelete}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      // Vuelve a cargar la lista de habitaciones para reflejar el cambio
      fetchTodasHabitaciones();
      setShowConfirm(false);
      setHabitacionToDelete(null);
    } catch (err) {
      console.error("Error al eliminar la habitacion:", err);
      setError("Error al eliminar la habitacion. Podria tener reservas activas.");
    }
  };

  const confirmDelete = (id) => {
    setHabitacionToDelete(id);
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="habitaciones-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando habitaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="habitaciones-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habitaciones-container">
      <div className="habitaciones-content">
        <div className="header-flex">
          <h1 className="habitaciones-title">Gestión de Habitaciones</h1>
          <button onClick={handleCreateRoom} className="create-button">
            Crear Nueva Habitación
          </button>
        </div>

        <div className="filtro-fechas">
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            placeholder="Fecha de inicio"
          />
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            placeholder="Fecha de fin"
          />
          <button onClick={fetchHabitacionesDisponibles} className="search-buttonh">
            Buscar Disponibles
          </button>
          <button onClick={fetchTodasHabitaciones} className="reset-buttonh">
            Mostrar Todas
          </button>
        </div>

        <div className="habitaciones-grid">
          {habitaciones.length > 0 ? (
            habitaciones.map((habitacion) => (
              <div key={habitacion.id} className="habitacion-card">
                <h2 className="card-title">Habitación {habitacion.id}</h2>
                <p className="card-text">
                  <span className="card-label">Tipo:</span> {habitacion.tipo}
                </p>
                <p className="card-text">
                  <span className="card-label">Estado:</span>{" "}
                  <span className={`estado-badge estado-${habitacion.estado.toLowerCase()}`}>
                    {habitacion.estado}
                  </span>
                </p>
                <p className="card-text">
                  <span className="card-label">Precio:</span> ${habitacion.precio}
                </p>
                <div className="card-actions">
                  <button onClick={() => handleEditRoom(habitacion.id)} className="edit-button">
                    Editar
                  </button>
                  <button onClick={() => confirmDelete(habitacion.id)} className="delete-button">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-habitaciones-text">No hay habitaciones disponibles para las fechas seleccionadas.</p>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de que quieres eliminar esta habitación?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteRoom} className="modal-confirm">Sí, eliminar</button>
              <button onClick={() => setShowConfirm(false)} className="modal-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
