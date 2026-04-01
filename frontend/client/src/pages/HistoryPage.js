import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          'http://localhost:5007/api/transactions/history'
        );
        setTransactions(res.data);
      } catch (err) {
        setError('No se pudo cargar el historial de transacciones.');
      }
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="transaction-history">
      <h2>Historial de Transacciones</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th style={{ textAlign: 'right' }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{new Date(tx.created_at).toLocaleString('es-CO')}</td>
              <td style={{ textTransform: 'capitalize' }}>{tx.type}</td>
              <td
                style={{
                  textAlign: 'right',
                  color:
                    tx.type.includes('deposit') ||
                    tx.type.includes('transfer-in')
                      ? 'var(--success-color)'
                      : 'var(--danger-color)',
                }}
              >
                {tx.type.includes('deposit') || tx.type.includes('transfer-in')
                  ? '+'
                  : '-'}{' '}
                ${parseFloat(tx.amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {transactions.length === 0 && !error && (
        <p style={{ textAlign: 'center' }}>
          No hay transacciones para mostrar.
        </p>
      )}
      <Link to="/dashboard" className="page-link">
        Volver al Dashboard
      </Link>
    </div>
  );
};

export default HistoryPage;
