import React, { useState, useEffect } from "react"; 
import axios from "axios"; 
import { useNavigate } from "react-router-dom"; 
import './Reservas.css'; 

export default function CrearReserva() { 
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;;
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({ 
    cliente: "", 
    habitacion: "", 
    fecha_inicio: "", 
    fecha_fin: "" 
  }); 
  const [clientes, setClientes] = useState([]); 
  // Ahora guardamos todas las habitaciones y luego las filtramos
  const [habitaciones, setHabitaciones] = useState([]); 
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [error, setError] = useState(null); 
  const [success, setSuccess] = useState(null); 
  const [loading, setLoading] = useState(true); 

  // Cargar clientes y habitaciones al iniciar el componente 
  useEffect(() => { 
    const fetchSelectData = async () => { 
      const token = localStorage.getItem('token'); 
      if (!token) { 
        setError("No hay token de autenticacion."); 
        setLoading(false); 
        return; 
      } 
      try { 
        const [clientesResponse, habitacionesResponse] = await Promise.all([ 
          axios.get(`${API_BASE_URL}/clientes/`, { headers: { 'Authorization': `Token ${token}` } }), 
          axios.get(`${API_BASE_URL}/habitaciones/`, { headers: { 'Authorization': `Token ${token}` } }), 
        ]); 
        setClientes(clientesResponse.data); 
        setHabitaciones(habitacionesResponse.data);
      } catch (err) { 
        console.error("Error al obtener datos:", err); 
        setError("Error al cargar los datos de clientes y habitaciones."); 
      } finally { 
        setLoading(false); 
      } 
    }; 
    fetchSelectData(); 
  }, []); 

  // Este useEffect filtra las habitaciones disponibles cada vez que cambia el estado de 'habitaciones'
  useEffect(() => {
    const habitacionesFiltradas = habitaciones.filter(h => h.estado === 'disponible');
    setHabitacionesDisponibles(habitacionesFiltradas);
  }, [habitaciones]);


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
      const response = await axios.post(`${API_BASE_URL}/reservas/`, formData, { 
        headers: { 
          'Authorization': `Token ${token}` 
        } 
      }); 
      const newReservaId = response.data.id; 
      setSuccess("Reserva creada exitosamente."); 

      //Redirigir a la página de pagos, pasando el ID de la nueva reserva 
      setTimeout(() => { 
        navigate('/crear-pago', { state: { reservaId: newReservaId } }); 
      }, 1000); 
    } catch (err) { 
      console.error("Error al crear la reserva:", err.response ? err.response.data : err.message); 
      if (err.response && err.response.data) { 
        console.log(err.response.status);
        console.log(err.response.data);
        setError("Error: " + JSON.stringify(err.response.data)); 
      } else { 
        setError("Error al crear la reserva. Verifique los datos."); 
      } 
    } 
  }; 

  if (loading) { 
    return ( 
      <div className="crear-reserva-container"> 
        <div className="loading-spinner"></div> 
        <p className="loading-text">Cargando datos para la reserva...</p> 
      </div> 
    ); 
  } 
   
  return ( 
    <div className="crear-reserva-container"> 
      <div className="form-card"> 
        <h1 className="crear-reserva-title">Crear Nueva Reserva</h1> 
         
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
              {habitacionesDisponibles.map(habitacion => ( 
                <option key={habitacion.id} value={habitacion.id}>Habitación {habitacion.id} - {habitacion.tipo} (${habitacion.precio} por noche)</option> 
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
          <button type="submit" className="submit-button">Crear Reserva</button> 
        </form> 
        <button onClick={() => navigate('/reservas')} className="back-button"> 
          Cancelar 
        </button> 
      </div> 
    </div> 
  ); 
}