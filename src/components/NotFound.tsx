import { UserX } from "lucide-react"

const NotFound = () => {
  return (
    <div className="grid justify-center">
        <div className="flex justify-center text-2xl">
            <UserX size={"48px"}/>
        </div>
        
        <h1>Nenhum usuário encontrado.</h1>
    </div>
  )
}

export default NotFound