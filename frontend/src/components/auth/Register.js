import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('recepcionista');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/usuarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          rol,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      // Mostrar mensaje de éxito
      setSuccess('✅ Usuario registrado con éxito, redirigiendo al inicio de sesión...');
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');

      // Esperar 2 segundos antes de redirigir
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Registro de Usuario</h2>
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={styles.input}
          required
        />
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          style={styles.input}
        >
          <option value="administrador">Administrador</option>
          <option value="recepcionista">Recepcionista</option>
          <option value="gerente">Gerente</option>
        </select>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Registrar</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  form: {
    backgroundColor: '#fff',
    padding: '40px 30px',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: '25px',
    textAlign: 'center',
    color: '#333',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  input: {
    padding: '12px 15px',
    marginBottom: '20px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    padding: '12px',
    backgroundColor: '#667eea',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
  error: {
    marginBottom: '15px',
    color: '#e74c3c',
    textAlign: 'center',
  },
  success: {
    marginBottom: '15px',
    color: '#27ae60',
    textAlign: 'center',
  },
};

export default Register;
