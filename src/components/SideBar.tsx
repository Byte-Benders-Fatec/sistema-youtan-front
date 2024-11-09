import ApiService from "@/services/ApiService"
import { 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Text,
  UsersRound,
  User,
} from "lucide-react"

const SideBarLayout = () => {
  const logout = () => {
    const apiService = new ApiService();
    const apiEndpoint = "public/auth/logout";

    apiService.get(apiEndpoint)
    localStorage.removeItem("is-auth");
    window.location.href = "/login"
  }

  
  type UserRole = "Admin" | "Líder" | "Líder e Liderado" | "Liderado" | null;
  const userRole = localStorage.getItem("is-auth") as UserRole;

  type RoleLinks = {
    [key: string]: { endpoint: string; component: React.ComponentType<{ className?: string }>; name: string }[];
    Admin: { endpoint: string; component: React.ComponentType<{ className?: string }>; name: string }[];
  };
  const roleBtns: RoleLinks = {
    "Admin": [
      {
        "endpoint": "/dashboard",
        "component": LayoutDashboard,
        "name": "Dashboard"
      },
      {
        "endpoint": "/usuarios",
        "component": User,
        "name": "Usuários"
      },
      {
        "endpoint": "/times",
        "component": UsersRound,
        "name": "Times"
      },
      {
        "endpoint": "/formularios",
        "component": Text,
        "name": "Formulários"
      },
    ],
    "Líder": [
      {
        "endpoint": "/dashboard",
        "component": LayoutDashboard,
        "name": "Dashboard"
      },
      {
        "endpoint": "/times",
        "component": UsersRound,
        "name": "Meu time"
      },
      {
        "endpoint": "/formularios/responder",
        "component": Text,
        "name": "Formulários"
      },
    ],
    "Líder e Liderado": [
      {
        "endpoint": "/dashboard",
        "component": LayoutDashboard,
        "name": "Dashboard"
      },
      {
        "endpoint": "/times",
        "component": UsersRound,
        "name": "Meu time"
      },
      {
        "endpoint": "/formularios/responder",
        "component": Text,
        "name": "Formulários"
      },
    ],
    "Liderado": [
      {
        "endpoint": "/dashboard",
        "component": LayoutDashboard,
        "name": "Dashboard"
      },
      {
        "endpoint": "/formularios/responder",
        "component": Text,
        "name": "Formulários"
      },
    ]
  }
  return (
    <aside className="w-64 bg-white shadow-md">
          <div className="p-4">
              <h1 className="text-2xl font-bold text-blue-600">YOUTAN</h1>
          </div>
          <nav className="mt-8">

            {userRole? roleBtns[userRole].map((btn, idx) => {
              const ComponentIcon = btn.component;
              
              return (
                <a href={btn.endpoint} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200" key={idx}>
                  <ComponentIcon className="mr-3 h-5 w-5" />
                  {btn.name}
                </a>
              );
            }) : window.location.href = "/login"}

          </nav>

          <div className="absolute bottom-0 w-64 p-4">
            <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
              <Settings className="mr-3 h-5 w-5" />
                Configurações
            </a>
            <a href="#" onClick={logout} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
              <LogOut className="mr-3 h-5 w-5" />
                Sair
            </a>
          </div>
      </aside>
  )
}

export default SideBarLayout;
