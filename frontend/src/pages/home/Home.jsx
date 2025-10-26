import React from "react";
import { FaHotel, FaConciergeBell, FaUsers, FaHistory, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const cards = [
    {
      icon: <FaHotel size={40} className="icon-blue" />,
      title: "Gestion de Habitaciones",
      description: "Administra y controla la disponibilidad de las habitaciones.",
      route: "/habitaciones"
    },
    {
      icon: <FaConciergeBell size={40} className="icon-green" />,
      title: "Reservas",
      description: "Gestiona las reservas y asegura la ocupacion optima.",
      route: "/reservas"
    },
    {
      icon: <FaUsers size={40} className="icon-purple" />,
      title: "Clientes",
      description: "Manten un registro completo de tus huespedes.",
      route: "/clientes"
    },
    {
      icon: <FaChartBar size={40} className="icon-orange" />,
      title: "Reportes",
      description: "Genera informes detallados de reservas e ingresos.",
      route: "/reportes"
    }
  ];

  const handleNavigateToPagos = () => {
    navigate("/pagos");
  };

  return (
    <div className="home-container">
      <div className="card-container">
        <div className="header-with-button">
          <h1 className="home-title">Panel Administrativo</h1>
          <button onClick={handleNavigateToPagos} className="history-button">
            <FaHistory className="button-icon" /> Historial de Pagos
          </button>
        </div>
        <div className="home-grid">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.route)}
              className="home-card"
            >
              <div className="icon-wrapper">{card.icon}</div>
              <h2 className="card-title">{card.title}</h2>
              <p className="card-description">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
