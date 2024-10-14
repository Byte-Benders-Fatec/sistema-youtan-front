import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from "./routes/Login";
import SignUp from './routes/SignUp';
import NotFound from './routes/NotFound'; // Componente de página não encontrada

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/cadastro",
    element: <SignUp />
  },
  {
    path: "*", // Rota catch-all para 404
    element: <NotFound />
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
