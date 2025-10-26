import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomeNavbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login"); 
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logoLink}>
          <h1 style={styles.logo}>Sistema Gestor de Hoteles</h1>
        </Link>
        <div style={styles.links}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    padding: "1rem 2rem",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  logo: {
    color: "#fff",
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  logoLink: {
    textDecoration: "none",
  },
  links: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
  },
  logoutBtn: {
    backgroundColor: "#fff",
    color: "#764ba2",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
