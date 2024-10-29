import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function Pagination(props: {name: string, filterPage: number, totalUsersPage: number}) {

    const handleNextPage = () => {
    window.location.href = `/${props.name}/?page=${props.filterPage + 1}`
    }
    
    const handlePreviousPage = () => {
    window.location.href = `/${props.name}/?page=${props.filterPage - 1}`
    } 

    return (
        <>
        <div className="flex justify-between mt-auto pt-4 border-t">
              <Button variant="outline" disabled={props.filterPage <= 1} size="sm" onClick={handlePreviousPage}>
                <ChevronLeft className="mr-2  h-4 w-4" />
                Anterior
              </Button>
              <span>Página {props.filterPage} de {props.totalUsersPage}</span>
                <Button variant="outline" disabled={props.filterPage >= props.totalUsersPage} size="sm" onClick={handleNextPage}>
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </>
    )
}