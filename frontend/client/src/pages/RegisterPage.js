import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ fullName: '', pin: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { fullName, pin } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!/^\d{4}$/.test(pin)) {
      setError('El PIN debe contener exactamente 4 dígitos.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5007/api/users/register', {
        fullName,
        pin,
      });
      setMessage(
        `Registro exitoso. Su número de cuenta es: ${res.data.user.accountNumber}. Por favor, guárdelo.`
      );
      setFormData({ fullName: '', pin: '' });
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Crear una Cuenta
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-semibold mb-2"
          >
            Nombre Completo
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={fullName}
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
            PIN de 4 dígitos
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
          {isLoading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
      )}
      <p className="text-center text-gray-600 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-semibold"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
