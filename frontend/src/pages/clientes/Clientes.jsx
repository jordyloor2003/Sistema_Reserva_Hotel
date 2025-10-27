import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './Clientes.css';

export default function Clientes() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchClientes = async (query = "") => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion. Por favor, inicie sesion.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/clientes/?search=${query}`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      setClientes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener los clientes:", err);
      setError("Error al cargar los clientes. Por favor, intentelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSearch = () => {
    fetchClientes(searchTerm);
  };

  const handleCreateCliente = () => {
    navigate('/crear-cliente');
  };

  const handleEditCliente = (id) => {
    navigate(`/editar-cliente/${id}`);
  };

  const handleDeleteCliente = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No hay token de autenticacion.");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/clientes/${clienteToDelete}/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      fetchClientes();
      setShowConfirm(false);
      setClienteToDelete(null);
    } catch (err) {
      console.error("Error al eliminar el cliente:", err);
      setError("Error al eliminar el cliente. Verifique si tiene reservas activas.");
    }
  };

  const confirmDelete = (id) => {
    setClienteToDelete(id);
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="clientes-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clientes-container">
        <div className="error-card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clientes-container">
      <div className="clientes-content">
        <div className="header-flex">
          <h1 className="clientes-title">Gestión de Clientes</h1>
          <button onClick={handleCreateCliente} className="create-button">
            Crear Nuevo Cliente
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre, documento, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch} className="search-button">
            Buscar
          </button>
          <button onClick={() => { setSearchTerm(""); fetchClientes(); }} className="reset-button">
            Limpiar
          </button>
        </div>

        <div className="clientes-grid">
          {clientes.length > 0 ? (
            clientes.map((cliente) => (
              <div key={cliente.id} className="cliente-card">
                <h2 className="card-title">{cliente.nombre}</h2>
                <p className="card-text"><span className="card-label">Documento:</span> {cliente.documento}</p>
                <p className="card-text"><span className="card-label">Email:</span> {cliente.email}</p>
                <p className="card-text"><span className="card-label">Teléfono:</span> {cliente.telefono}</p>
                <div className="card-actions">
                  <button onClick={() => handleEditCliente(cliente.id)} className="edit-button">
                    Editar
                  </button>
                  <button onClick={() => confirmDelete(cliente.id)} className="delete-button">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-clientes-text">No se encontraron clientes.</p>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>¿Estás seguro de que quieres eliminar a este cliente?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteCliente} className="modal-confirm">Sí, eliminar</button>
              <button onClick={() => setShowConfirm(false)} className="modal-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
