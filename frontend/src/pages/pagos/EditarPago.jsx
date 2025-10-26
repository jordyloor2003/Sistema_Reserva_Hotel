import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './Pagos.css';

export default function EditarPago() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    monto: "",
    tipo_pago: "",
    estado: "",
    reserva: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fechaPago, setFechaPago] = useState("");
  const [reservaInfo, setReservaInfo] = useState({});

  useEffect(() => {
    const fetchPago = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("No hay token de autenticacion.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/pagos/${id}/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        const pagoData = response.data;
        setFormData({
          monto: pagoData.monto,
          tipo_pago: pagoData.tipo_pago,
          estado: pagoData.estado,
          reserva: pagoData.reserva,
        });
        setFechaPago(pagoData.fecha_pago);
        setReservaInfo(pagoData.reserva_resumen);
      } catch (err) {
        console.error("Error al obtener el pago:", err);
        setError("No se pudo cargar el pago. Intentelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchPago();
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
      await axios.put(`http://127.0.0.1:8000/api/pagos/${id}/`, formData, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setSuccess("Pago actualizado exitosamente.");
      setTimeout(() => {
        navigate('/pagos');
      }, 1500);
    } catch (err) {
      console.error("Error al actualizar el pago:", err.response ? err.response.data : err.message);
      if (err.response && err.response.data) {
        setError("Error: " + JSON.stringify(err.response.data));
      } else {
        setError("Error al actualizar el pago. Verifique los datos.");
      }
    }
  };

  if (loading) {
    return (
      <div className="editar-pago-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando datos del pago...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-pago-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
          <button onClick={() => navigate('/pagos')} className="back-button">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-pago-container">
      <div className="form-card">
        <h1 className="editar-pago-title">Editar Pago #{id}</h1>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ID de Reserva</label>
            <p className="read-only-field">{formData.reserva}</p>
            {reservaInfo && (
              <p className="reserva-info">
                **Cliente:** {reservaInfo.cliente_nombre} - **Habitación:** {reservaInfo.habitacion_id}
              </p>
            )}
          </div>
          <div className="form-group">
            <label>Fecha de Pago</label>
            <p className="read-only-field">{fechaPago}</p>
          </div>
          <div className="form-group">
            <label htmlFor="monto">Monto</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
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
          <button type="submit" className="submit-button">Guardar Cambios</button>
        </form>
        <button onClick={() => navigate('/pagos')} className="back-button">
          Cancelar
        </button>
      </div>
    </div>
  );
}
