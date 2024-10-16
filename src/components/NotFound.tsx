import { X } from "lucide-react"
import React from "react"

const NotFound = (props) => {
  return (
    <div className="grid justify-center">
        <div className="flex justify-center text-2xl">
            <X size={"48px"}/>
            {props.icon}
        </div>
        
        <h1>Nenhum {props.name} encontrado.</h1>
    </div>
  )
}

export default NotFound