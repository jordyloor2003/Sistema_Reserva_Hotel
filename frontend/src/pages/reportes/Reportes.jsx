import React, { useState } from "react";
import axios from "axios";
import { FileText, DollarSign, Search, RefreshCcw } from 'lucide-react';
import './Reportes.css';

const API_BASE_URL = "http://127.0.0.1:8000/api/reportes/";

export default function Reportes() {
  const [reportType, setReportType] = useState("reservas");
  const [reservaFilters, setReservaFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
  });
  const [ingresosFilters, setIngresosFilters] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    tipo_pago: "",
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    setError(null);
    setSuccess(null);
    const token = getToken();

    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let params = {};

      if (reportType === 'reservas') {
        endpoint = 'reservas/';
        params = reservaFilters;
      } else {
        endpoint = 'ingresos/';
        params = ingresosFilters;
      }

      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        params: params,
        headers: { 'Authorization': `Token ${token}` },
      });

      setReportData(response.data);
      setSuccess("Reporte generado exitosamente.");
    } catch (err) {
      console.error("Error al obtener el reporte:", err);
      setError("Error al cargar el reporte. Por favor, intentelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReservaFilterChange = (e) => {
    const { name, value } = e.target;
    setReservaFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleIngresosFilterChange = (e) => {
    const { name, value } = e.target;
    setIngresosFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setReservaFilters({ fecha_inicio: "", fecha_fin: "", estado: "" });
    setIngresosFilters({ fecha_inicio: "", fecha_fin: "", tipo_pago: "" });
    setReportData(null);
    setError(null);
    setSuccess(null);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="loader-container">
          <div className="loader"></div>
          <p>Cargando reporte...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="message error">
          <p>{error}</p>
        </div>
      );
    }
    
    if (!reportData) {
      return (
        <div className="message info">
          <p>Selecciona un tipo de reporte y los filtros para generarlo.</p>
        </div>
      );
    }
    

    if (reportType === 'reservas') {
      return (
        <div>
          <h3 className="report-title">Reporte de Reservas</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo de Habitación</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length > 0 ? (
                  reportData.map((reserva, index) => (
                    <tr key={index}>
                      <td>{reserva.cliente__nombre}</td>
                      <td>{reserva.habitacion__tipo}</td>
                      <td>{reserva.fecha_inicio}</td>
                      <td>{reserva.fecha_fin}</td>
                      <td>
                        <span className={`status-badge status-${reserva.estado}`}>
                          {reserva.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No se encontraron reservas con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (reportType === 'ingresos') {
      return (
        <div className="ingresos-report">
          <h3 className="report-title">Reporte de Ingresos</h3>
          <div className="total-ingresos">
            <span className="total-label">Total de Ingresos:</span>
            <span className="total-amount">${reportData.total_general.toFixed(2)}</span>
          </div>

          <h4 className="detail-title">Detalle por Tipo de Pago:</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tipo de Pago</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.detalle_por_tipo.length > 0 ? (
                  reportData.detalle_por_tipo.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tipo_pago}</td>
                      <td>${item.total.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="no-data">
                      No se encontraron pagos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="reportes-container">
      <h1 className="main-title">Generar Reportes</h1>

      <div className="report-selector">
        <button
          onClick={() => { setReportType('reservas'); setReportData(null); }}
          className={`tab-button ${reportType === 'reservas' ? 'active' : ''}`}
        >
          <FileText size={20} /> Reporte de Reservas
        </button>
        <button
          onClick={() => { setReportType('ingresos'); setReportData(null); }}
          className={`tab-button ${reportType === 'ingresos' ? 'active' : ''}`}
        >
          <DollarSign size={20} /> Reporte de Ingresos
        </button>
      </div>

      <div className="filters-card">
        <h2 className="card-title">Filtros</h2>
        
        {reportType === 'reservas' && (
          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="fecha_inicio_reserva">Fecha de inicio</label>
              <input
                type="date"
                id="fecha_inicio_reserva"
                name="fecha_inicio"
                value={reservaFilters.fecha_inicio}
                onChange={handleReservaFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fecha_fin_reserva">Fecha de fin</label>
              <input
                type="date"
                id="fecha_fin_reserva"
                name="fecha_fin"
                value={reservaFilters.fecha_fin}
                onChange={handleReservaFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={reservaFilters.estado}
                onChange={handleReservaFilterChange}
              >
                <option value="">Todos</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>
        )}
        
        {reportType === 'ingresos' && (
          <div className="filters-grid">
            <div className="form-group">
              <label htmlFor="fecha_inicio_ingreso">Fecha de inicio</label>
              <input
                type="date"
                id="fecha_inicio_ingreso"
                name="fecha_inicio"
                value={ingresosFilters.fecha_inicio}
                onChange={handleIngresosFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fecha_fin_ingreso">Fecha de fin</label>
              <input
                type="date"
                id="fecha_fin_ingreso"
                name="fecha_fin"
                value={ingresosFilters.fecha_fin}
                onChange={handleIngresosFilterChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tipo_pago">Tipo de pago</label>
              <select
                id="tipo_pago"
                name="tipo_pago"
                value={ingresosFilters.tipo_pago}
                onChange={handleIngresosFilterChange}
              >
                <option value="">Todos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={handleResetFilters}
            className="btn btn-secondary"
          >
            <RefreshCcw size={20} /> Limpiar
          </button>
          <button
            onClick={fetchReport}
            className="btn btn-primary"
          >
            <Search size={20} /> Generar Reporte
          </button>
        </div>
      </div>

      <div className="report-card">
        {renderReportContent()}
      </div>
    </div>
  );
}
