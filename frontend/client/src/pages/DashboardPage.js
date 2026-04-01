import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeSlashedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
    />
  </svg>
);

const DashboardPage = () => {
  const { user, setUser, token, logout } = useAuth();
  const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get('http://localhost:5007/api/users/profile');
      setUser(res.data);
    } catch (err) {
      logout();
      navigate('/login');
    }
  }, [token, navigate, setUser, logout]);

  useEffect(() => {
    if (!user || !user.balance) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDetailsVisibility = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };

  if (!user) {
    return (
      <p className="text-center text-gray-500 mt-10">Cargando perfil...</p>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Bienvenido, {user.fullName}
      </h2>
      <div className="relative max-w-lg mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg text-center">
        <button
          onClick={toggleDetailsVisibility}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          {isDetailsVisible ? <EyeSlashedIcon /> : <EyeIcon />}
        </button>
        <p className="text-gray-500 text-lg">Saldo Actual</p>
        <p className="text-5xl font-bold text-blue-600 my-2 tracking-wider">
          {isDetailsVisible
            ? `$${user.balance ? parseFloat(user.balance).toFixed(2) : '0.00'}`
            : '$ ••••••'}
        </p>
        <p className="text-gray-400">
          {isDetailsVisible
            ? `Cuenta N°: ${user.accountNumber}`
            : 'Cuenta N°: **** **** **** ****'}
        </p>
      </div>
      <div className="mt-8 flex justify-center flex-wrap gap-4">
        <Link
          to="/deposit"
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105"
        >
          Depositar
        </Link>
        <Link
          to="/withdraw"
          className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg shadow-md hover:bg-yellow-600 transition-transform transform hover:scale-105"
        >
          Retirar
        </Link>
        <Link
          to="/transfer"
          className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg shadow-md hover:bg-purple-600 transition-transform transform hover:scale-105"
        >
          Transferir
        </Link>
        <Link
          to="/history"
          className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition-transform transform hover:scale-105"
        >
          Historial
        </Link>
      </div>
      <div className="text-center mt-10">
        <button
          onClick={handleLogout}
          className="text-red-500 hover:underline font-medium"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
