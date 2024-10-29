import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from "./routes/Login";
import DashboardLayout from './components/DashboardLayout';
import Users from './routes/Users';
import TeamsPage from './pages/Teams';
import FormsPage from './pages/Forms';
import QuestionsPage from './pages/Questions';
import UsersTable from './components/UsersTable';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
  },
  {
    path: "/usuarios",
    element: <Users />,
    children: [
      {
        path: "",
        element: <UsersTable />
      }
    ]
  },
  {
    path: "/times",
    element: <TeamsPage />,
  },
  {
    path: "/login",
    element: <Login />,

  },
  {
    path: "/formularios",
    element: <FormsPage />,
    children: [
      {
        path: ":id",
        element: <QuestionsPage />
      }
    ]
  },

]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
