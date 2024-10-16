import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut,
  Text,
  UsersRound,
  User,
} from "lucide-react"

const SideBarLayout = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
          <div className="p-4">
              <h1 className="text-2xl font-bold text-blue-600">YOUTAN</h1>
          </div>
          <nav className="mt-8">
            <a href="/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
                <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </a>
              <a href="/usuarios" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
                <User className="mr-3 h-5 w-5" />
                  Usuários
                </a>
              <a href="/times" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
                <UsersRound className="mr-3 h-5 w-5" />
                  Times
              </a>
              <a href="/formularios" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
                <Text className="mr-3 h-5 w-5" />
                  Formulários
              </a>
          </nav>
          <div className="absolute bottom-0 w-64 p-4">
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
              <Settings className="mr-3 h-5 w-5" />
              Configurações
              </a>
              <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200">
              <LogOut className="mr-3 h-5 w-5" />
              Sair
              </a>
          </div>
      </aside>
  )
}

export default SideBarLayout;