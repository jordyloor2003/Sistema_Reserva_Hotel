import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import './Pagos.css';

export default function Pagos() {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [pagos, setPagos] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo_pago: "",
    estado: "",
    search: ""
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener todos los pagos y sus datos relacionados
  const fetchPagos = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    try {
      const query = new URLSearchParams(filtros).toString();
      // Usamos Promise.all para cargar pagos, clientes, habitaciones y reservas al mismo tiempo
      const [pagosRes, clientesRes, habitacionesRes, reservasRes] = await Promise.all([
        axios.get(`${API_URL}/pagos/?${query}`, { headers: { 'Authorization': `Token ${token}` } }),
        axios.get(`${API_URL}/clientes/`, { headers: { 'Authorization': `Token ${token}` } }),
        axios.get(`${API_URL}/habitaciones/`, { headers: { 'Authorization': `Token ${token}` } }),
        axios.get(`${API_URL}/reservas/`, { headers: { 'Authorization': `Token ${token}` } })
      ]);

      // Mapear los datos de clientes, habitaciones y reservas a objetos para un acceso rápido
      const clientesMap = clientesRes.data.reduce((acc, cliente) => {
        acc[cliente.id] = cliente;
        return acc;
      }, {});

      const habitacionesMap = habitacionesRes.data.reduce((acc, habitacion) => {
        acc[habitacion.id] = habitacion;
        return acc;
      }, {});

      const reservasMap = reservasRes.data.reduce((acc, reserva) => {
        acc[reserva.id] = reserva;
        return acc;
      }, {});

      // Mapear los pagos y enriquecerlos con los datos de clientes y habitaciones
      const pagosConDatos = pagosRes.data.map(pago => {
        const reserva = reservasMap[pago.reserva_id];
        if (reserva) {
          const cliente = clientesMap[reserva.cliente];
          const habitacion = habitacionesMap[reserva.habitacion];
          return {
            ...pago,
            cliente_nombre: cliente ? `${cliente.nombre}` : 'Desconocido',
            habitacion_numero: habitacion ? `${habitacion.id}` : 'Desconocido',
          };
        }
        // Si no hay reserva, el cliente y la habitación son N/A
        return {
          ...pago,
          cliente_nombre: 'N/A',
          habitacion_numero: 'N/A',
        };
      });

      // Filtra la lista de pagos en el frontend usando el `search` si no se pudo hacer en el backend
      const filteredPagos = pagosConDatos.filter(pago => {
        if (!filtros.search) return true;
        const searchTerm = filtros.search.toLowerCase();
        // Búsqueda por nombre de cliente o número de habitación
        return (
          pago.cliente_nombre.toLowerCase().includes(searchTerm) ||
          pago.habitacion_numero.toString().includes(searchTerm)
        );
      });

      setPagos(filteredPagos);
      setError(null);
    } catch (err) {
      console.error("Error al obtener los pagos:", err);
      setError("Error al cargar los pagos. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [location.state, filtros.tipo_pago, filtros.estado]); // Re-fetch al cambiar filtros o al regresar de otra página

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      [name]: value,
    }));
  };

  const handleCreatePago = () => {
    navigate(`${API_URL}/crear-pago`);
  };

  const handleEditPago = (id) => {
    navigate(`${API_URL}/editar-pago/${id}`);
  };

  const handleDeletePago = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/pagos/${pagoToDelete}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      fetchPagos(); // Refrescar la lista de pagos
      setShowConfirm(false);
      setPagoToDelete(null);
    } catch (err) {
      console.error("Error al eliminar el pago:", err);
      setError("Error al eliminar el pago.");
    }
  };

  const confirmDelete = (id) => {
    setPagoToDelete(id);
    setShowConfirm(true);
  };

  const resetFiltros = () => {
    setFiltros({
      tipo_pago: "",
      estado: "",
      search: ""
    });
  };

  if (loading) {
    return (
      <div className="pagos-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando pagos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagos-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pagos-container">
      <div className="pagos-content">
        <div className="header-flex">
          <h1 className="pagos-title">Gestión de Pagos</h1>
          <button onClick={handleCreatePago} className="create-button">
            Crear Nuevo Pago
          </button>
        </div>

        <div className="filtros-container">
          <select
            name="tipo_pago"
            value={filtros.tipo_pago}
            onChange={handleSearch}
          >
            <option value="">Todos los tipos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          <select
            name="estado"
            value={filtros.estado}
            onChange={handleSearch}
          >
            <option value="">Todos los estados</option>
            <option value="exitoso">Exitoso</option>
            <option value="pendiente">Pendiente</option>
            <option value="fallido">Fallido</option>
          </select>
          <input
            type="text"
            name="search"
            placeholder="Buscar por cliente o habitación..."
            value={filtros.search}
            onChange={handleSearch}
          />
          <button onClick={fetchPagos} className="search-button">
            Filtrar
          </button>
          <button onClick={resetFiltros} className="reset-button">
            Limpiar
          </button>
        </div>

        <div className="pagos-table-container">
          <table className="pagos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reserva (Cliente - Hab.)</th>
                <th>Monto</th>
                <th>Tipo de Pago</th>
                <th>Estado</th>
                <th>Fecha de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagos.length > 0 ? (
                pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>{pago.id}</td>
                    <td>
                      {pago.cliente_nombre && pago.habitacion_numero ? 
                        `Cliente: ${pago.cliente_nombre} - Habitación: ${pago.habitacion_numero}` : 
                        `Reserva #${pago.reserva} (datos no disponibles)`
                      }
                    </td>
                    <td>${pago.monto}</td>
                    <td>{pago.tipo_pago}</td>
                    <td>
                      <span className={`estado-badge estado-${pago.estado}`}>
                        {pago.estado}
                      </span>
                    </td>
                    <td>
                      {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="acciones-pago">
                        <button onClick={() => handleEditPago(pago.id)} className="edit-button">
                          Editar
                        </button>
                        <button onClick={() => confirmDelete(pago.id)} className="delete-button">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-pagos-text">No se encontraron pagos con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de que quieres eliminar este pago?</p>
            <p>Al eliminarlo, la reserva asociada ya no tendrá un pago registrado.</p>
            <div className="modal-actions">
              <button onClick={handleDeletePago} className="modal-confirm">Sí, eliminar</button>
              <button onClick={() => setShowConfirm(false)} className="modal-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
