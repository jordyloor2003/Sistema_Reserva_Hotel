import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRoutes from './Routes';

/***Layouts***/
import AuthNavbar from './components/layouts/AuthNavBar';
import HomeNavbar from './components/layouts/HomeNavBar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Función para actualizar token al login o logout
  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      {/* Navbar condicional según si hay token */}
      {token ? <HomeNavbar onLogout={handleLogout} /> : <AuthNavbar />}

      {/* Rutas */}
      <AppRoutes token={token} handleLogin={handleLogin} />

    </Router>
  );
}

export default App;