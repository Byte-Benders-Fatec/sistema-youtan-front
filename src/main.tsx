import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from "./routes/Login";
import Users from './routes/Users';
import TeamsPage from './pages/Teams';
import FormsPage from './pages/Forms';
import QuestionsPage from './pages/Questions';
import UsersTable from './components/UsersTable';
import DashboardsPage from './pages/Dashboards';
import FormsToAnswerTable from './components/FormsToAnswerTable';
import FormsTable from './components/FormsTable';
import AnswersPage from './pages/Answers';
import UserAnswersForm from './components/UserAnswersTable';
import MyTeamPage from './pages/MyTeam';
import AnswersTable from './components/AnswersTable';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/dashboard",
    element: <DashboardsPage />,
    children: [
      {
        path: ":from/:to",
        element: <AnswersTable />
      }
    ]
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
    path: "/meuTime",
    element: <MyTeamPage />,
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
      },
      {
        path: "",
        element: <FormsTable />
      },
      {
        path: "responder",
        element: <FormsToAnswerTable />,
        children:[
          {
            path:":id",
            element: <UserAnswersForm />
          },
        ]
  
      }
    ],
  },

  {
    path: "forms/:formId/respostas/:answerId",
    element: <AnswersPage/>,
  },

]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
)
