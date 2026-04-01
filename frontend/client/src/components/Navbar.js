import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { token } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to={token ? '/dashboard' : '/login'}
          className="text-2xl font-bold text-blue-600"
        >
          BancoK
        </Link>
        <div>
          {!token && (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="ml-4 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
