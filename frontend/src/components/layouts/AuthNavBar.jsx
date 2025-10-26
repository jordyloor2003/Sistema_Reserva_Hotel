import React from "react";
import { Link } from "react-router-dom";

export default function AuthNavbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h1 style={styles.logo}>Sistema Gestor de Hoteles</h1>
        <div style={styles.links}>
          <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
          <Link to="/register" style={styles.registerBtn}>Registrarse</Link>
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
  links: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    transition: "background 0.3s",
  },
  registerBtn: {
    backgroundColor: "#fff",
    color: "#764ba2",
    textDecoration: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
};
