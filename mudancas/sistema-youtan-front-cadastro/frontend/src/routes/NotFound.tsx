import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div style={{ backgroundColor: "black", color: 'white', padding: "20px", borderBottom: '10px'}}>
      <h1>Links para as telas: </h1>
      <p>Cadastro:</p>
      <a href="http://localhost:5173/cadastro">Tela de cadastro</a>
      <p>Login:</p>
      <a href="http://localhost:5173/login">Tela de Login</a>
    </div>
  );
};

export default NotFound;
