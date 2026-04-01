import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white shadow-inner mt-10 py-4">
      <div className="container mx-auto text-center text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} BancoK. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
