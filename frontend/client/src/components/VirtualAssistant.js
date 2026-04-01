import React, { useState } from 'react';

const VirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  const fabStyle = {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    zIndex: 1000,
  };

  const chatWindowStyle = {
    position: 'fixed',
    bottom: '100px',
    right: '30px',
    width: '300px',
    height: '400px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    zIndex: 1000,
  };

  const headerStyle = {
    background: '#007bff',
    color: 'white',
    padding: '10px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  };

  const contentStyle = {
    padding: '15px',
    flexGrow: 1,
    overflowY: 'auto',
    textAlign: 'left',
  };

  const qaPairStyle = {
    marginBottom: '15px',
  };

  return (
    <>
      <div style={chatWindowStyle}>
        <div style={headerStyle}>
          <strong>Asistente Virtual</strong>
        </div>
        <div style={contentStyle}>
          <h4>Preguntas Frecuentes</h4>
          <div style={qaPairStyle}>
            <strong>¿Cómo veo mi saldo?</strong>
            <p>
              Tu saldo actual se muestra en el Dashboard una vez que inicias
              sesión.
            </p>
          </div>
          <div style={qaPairStyle}>
            <strong>¿Cómo puedo cambiar mi PIN?</strong>
            <p>
              Actualmente, la funcionalidad para cambiar el PIN no está
              implementada. Contacta a soporte.
            </p>
          </div>
          <div style={qaPairStyle}>
            <strong>¿Mi información está segura?</strong>
            <p>
              Utilizamos los más altos estándares de seguridad, incluyendo
              tokens JWT y hasheo de PINs para proteger tu cuenta.
            </p>
          </div>
        </div>
      </div>
      <div style={fabStyle} onClick={() => setIsOpen(!isOpen)}>
        ?
      </div>
    </>
  );
};

export default VirtualAssistant;
