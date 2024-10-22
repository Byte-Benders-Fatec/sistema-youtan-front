import { X } from "lucide-react"

const NotFound = (props: {name: string}) => {
  return (
    <div className="flex-1 flex justify-center items-center">
        <div className="flex justify-center text-2xl">
            <X size={"48px"}/>
        </div>
        
        <h1>{props.name}</h1>
    </div>
  )
}

export default NotFound