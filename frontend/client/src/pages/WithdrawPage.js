import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const WithdrawPage = () => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useAuth();

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Por favor, ingresa una cantidad válida.');
      setIsLoading(false);
      return;
    }
    if (parsedAmount > parseFloat(user.balance)) {
      setError('Fondos insuficientes.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5007/api/transactions/withdraw',
        { amount }
      );
      setUser((prevUser) => ({ ...prevUser, balance: res.data.newBalance }));
      setMessage(
        `Retiro exitoso. Nuevo saldo: $${parseFloat(
          res.data.newBalance
        ).toFixed(2)}`
      );
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al realizar el retiro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Realizar un Retiro
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Saldo Actual:{' '}
        <strong className="text-gray-800">
          ${user ? parseFloat(user.balance).toFixed(2) : '0.00'}
        </strong>
      </p>
      <form onSubmit={handleWithdraw}>
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-gray-700 font-semibold mb-2"
          >
            Cantidad a Retirar
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : 'Retirar'}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-green-600 font-medium">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
      )}
      <div className="text-center mt-6">
        <Link
          to="/dashboard"
          className="text-blue-600 hover:underline font-semibold"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
};

export default WithdrawPage;
