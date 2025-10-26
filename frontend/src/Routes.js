import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';

//Rutas - Paginas
/***Auth***/
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoutes';
import PublicRoute from './components/auth/PublicRoutes';
import Register from './components/auth/Register';

/***Clientes***/
import Clientes from './pages/clientes/Clientes';
import CrearCliente from './pages/clientes/CrearCliente';
import EditarCliente from './pages/clientes/EditarCliente';

/***Habitaciones***/
import Habitaciones from './pages/habitaciones/Habitaciones';
import CrearHabitacion from './pages/habitaciones/CrearHabitacion';
import EditarHabitacion from './pages/habitaciones/EditarHabitacion';

/***Home***/
import Home from './pages/home/Home';

/***Pagos***/
import Pagos from './pages/pagos/Pagos';
import CrearPago from './pages/pagos/CrearPago';
import EditarPago from './pages/pagos/EditarPago';

/***Reportes***/
import Reportes from './pages/reportes/Reportes';

/***Reservas***/
import Reservas from './pages/reservas/Reservas';
import CrearReserva from './pages/reservas/CrearReserva';
import EditarReserva from './pages/reservas/EditarReserva'; 

const routesConfig = [
    // públicas
    { path: "/login", element: Login, isPublic: true },
    { path: "/register", element: Register, isPublic: true },

    // privadas
    { path: "/", element: Home },
    
    { path: "/habitaciones", element: Habitaciones },
    { path: "/crear-habitacion", element: CrearHabitacion },
    { path: "/editar-habitacion/:id", element: EditarHabitacion },
    
    { path: "/clientes", element: Clientes },
    { path: "/crear-cliente", element: CrearCliente },
    { path: "/editar-cliente/:id", element: EditarCliente },
    
    { path: "/reservas", element: Reservas },
    { path: "/crear-reserva", element: CrearReserva },
    { path: "/editar-reserva/:id", element: EditarReserva },
    
    { path: "/pagos", element: Pagos },
    { path: "/crear-pago", element: CrearPago },
    { path: "/editar-pago/:id", element: EditarPago },
    
    { path: "/reportes", element: Reportes },
];



const AppRoutes = ({token, handleLogin}) => {
    return (
        <Routes>
        {
            routesConfig.map(({ path, element: Component, isPublic }) => (
                <Route key={path} path={path} element={
                    isPublic ? (
                        <PublicRoute>
                            <Component onLogin={handleLogin} />
                        </PublicRoute>
                    ) : (
                        <PrivateRoute>
                            <Component />
                        </PrivateRoute>
                    )
                }/>
            ))
        }
    

      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
    </Routes>
  );
};

export default AppRoutes;