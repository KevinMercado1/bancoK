import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ accountNumber: '', pin: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { accountNumber, pin } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5007/api/users/login', {
        accountNumber,
        pin,
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Error de red o credenciales inválidas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Iniciar Sesión
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            htmlFor="accountNumber"
            className="block text-gray-700 font-semibold mb-2"
          >
            Número de Cuenta
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={accountNumber}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="pin"
            className="block text-gray-700 font-semibold mb-2"
          >
            PIN
          </label>
          <input
            type="password"
            id="pin"
            name="pin"
            value={pin}
            onChange={onChange}
            required
            minLength="4"
            maxLength="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
      )}
      <p className="text-center text-gray-600 mt-6">
        ¿No tienes cuenta?{' '}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-semibold"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
