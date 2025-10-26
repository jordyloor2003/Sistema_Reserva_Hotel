import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import './Pagos.css';

export default function CrearPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    monto: "",
    tipo_pago: "Efectivo",
    estado: "exitoso",
    reserva: ""
  });
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState({});
  const [habitaciones, setHabitaciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar reservas, clientes y habitaciones
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No hay token de autenticacion.");
        setLoading(false);
        return;
      }
      try {
        const [reservasRes, clientesRes, habitacionesRes] = await Promise.all([
          location.state && location.state.reservaId
            ? axios.get(`http://127.0.0.1:8000/api/reservas/${location.state.reservaId}/`, { headers: { 'Authorization': `Token ${token}` } })
            : axios.get("http://127.0.0.1:8000/api/reservas/?pago__isnull=true", { headers: { 'Authorization': `Token ${token}` } }),
          axios.get("http://127.0.0.1:8000/api/clientes/", { headers: { 'Authorization': `Token ${token}` } }),
          axios.get("http://127.0.0.1:8000/api/habitaciones/", { headers: { 'Authorization': `Token ${token}` } })
        ]);

        const clientesMap = clientesRes.data.reduce((acc, cliente) => {
          acc[cliente.id] = cliente;
          return acc;
        }, {});
        setClientes(clientesMap);

        const habitacionesMap = habitacionesRes.data.reduce((acc, habitacion) => {
          acc[habitacion.id] = habitacion;
          return acc;
        }, {});
        setHabitaciones(habitacionesMap);

        const fetchedReservas = location.state && location.state.reservaId ? [reservasRes.data] : reservasRes.data;
        setReservas(fetchedReservas);

        if (location.state && location.state.reservaId) {
          setFormData(prevData => ({ ...prevData, reserva: location.state.reservaId }));
        }

      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("Error al cargar los datos de clientes, habitaciones y reservas.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [location.state]);

  // useEffect para calcular el monto cuando se selecciona una reserva
  useEffect(() => {
    const selectedReservaId = parseInt(formData.reserva);
    if (selectedReservaId && reservas.length > 0 && Object.keys(habitaciones).length > 0) {
      const selectedReserva = reservas.find(res => res.id === selectedReservaId);
      if (selectedReserva) {
        const habitacion = habitaciones[selectedReserva.habitacion];
        
        const fechaEntrada = new Date(selectedReserva.fecha_inicio);
        const fechaSalida = new Date(selectedReserva.fecha_fin);
        
        // Verificación de fechas y precio
        if (
          habitacion && 
          !isNaN(habitacion.precio) && 
          !isNaN(fechaEntrada.getTime()) && 
          !isNaN(fechaSalida.getTime())
        ) {
          const diffTime = Math.abs(fechaSalida.getTime() - fechaEntrada.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const montoCalculado = diffDays * habitacion.precio;
          
          if (!isNaN(montoCalculado) && isFinite(montoCalculado)) {
            setFormData(prevData => ({ ...prevData, monto: montoCalculado.toFixed(2) }));
          } else {
            console.error("El calculo del monto resulto en un valor no valido. Verifique los datos de la reserva.");
            setFormData(prevData => ({ ...prevData, monto: "" }));
          }
        } else {
          console.error("No se pudo calcular el monto. Verifique los datos de la habitacion o las fechas de la reserva.");
          setFormData(prevData => ({ ...prevData, monto: "" }));
        }
      }
    } else if (!formData.reserva) {
        setFormData(prevData => ({ ...prevData, monto: "" }));
    }
  }, [formData.reserva, reservas, habitaciones]);

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
      await axios.post("http://127.0.0.1:8000/api/pagos/", formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Pago creado exitosamente.");
      setTimeout(() => {
        navigate('/pagos');
      }, 1500);
    } catch (err) {
      console.error("Error al crear el pago:", err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al crear el pago. Verifique los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="crear-pago-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando datos para el pago...</p>
      </div>
    );
  }
  
  return (
    <div className="crear-pago-container">
      <div className="form-card">
        <h1 className="crear-pago-title">Crear Nuevo Pago</h1>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reserva">Reserva</label>
            <select
              id="reserva"
              name="reserva"
              value={formData.reserva}
              onChange={handleChange}
              required
              disabled={location.state && location.state.reservaId} 
            >
              <option value="">Seleccione una reserva</option>
              {reservas.map(reserva => {
                const cliente = clientes[reserva.cliente];
                const habitacion = habitaciones[reserva.habitacion];
                const clienteNombre = cliente ? `${cliente.nombre}` : 'Desconocido';
                const habitacionNumero = habitacion ? `#${habitacion.id}/${habitacion.tipo}` : 'Desconocida';
                
                return (
                  <option key={reserva.id} value={reserva.id}>
                    Reserva #{reserva.id} - Cliente: {clienteNombre} - Habitación: {habitacionNumero}
                  </option>
                );
              })}
            </select>
            {location.state && location.state.reservaId && (
              <p className="reserva-info">
                Este pago está asociado a la reserva recién creada.
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="monto">Monto</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              readOnly
              disabled
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tipo_pago">Tipo de Pago</label>
            <select
              id="tipo_pago"
              name="tipo_pago"
              value={formData.tipo_pago}
              onChange={handleChange}
              required
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
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
              <option value="exitoso">Exitoso</option>
              <option value="pendiente">Pendiente</option>
              <option value="fallido">Fallido</option>
            </select>
          </div>
          <button type="submit" className="submit-button">Crear Pago</button>
        </form>
        <button onClick={() => navigate('/pagos')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
