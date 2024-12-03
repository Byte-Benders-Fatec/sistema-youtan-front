import { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ClipboardPen, FileSymlink, LoaderCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { 
  Filter, 
  Download
} from "lucide-react"
import {Answer, Form} from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import ApiService from '@/services/ApiService'
import NotFound from './NotFound'
import { Link } from 'react-router-dom'
import Pagination from './Pagination'

const FormsToAnswerTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);
    
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [filterPage, setFilterPage] = useState(page)
    const [totalFormsPage, setTotalFormsPage] = useState(1)

    const formatDate = (dataTimestamp: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dataTimestamp));;
    }
    

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const [answersResponse] = await Promise.all([
                  apiService.get(`${apiEndpoint}`, {"take": take, "page": page}),
                  new Promise(resolve => setTimeout(resolve, 1500))
                ])

                setAnswers(Array.isArray(answersResponse.data.answers) ? (answersResponse.data.answers
                  .filter((answer: Answer) => !answer.userHasAnswered))
                  .map((answer: Answer) => answer) : []);
                  
                setTotalFormsPage(answersResponse.data.total? Math.ceil(answersResponse.data.total / take) : 1)
            } catch (error) {
              console.error('Erro ao buscar formulários:', error);
              setAnswers([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchForms();
    }, []);

    return (
      <Card className='min-h-[70vh] flex flex-col'>
        <CardHeader>
          <CardTitle className='text-2xl'>Formulários Para Responder</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {isInitialLoading ? (
            <div className="flex-1 flex justify-center items-center h-64">
              <LoaderCircle className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <>
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center flex-1 max-w-lg">
              <Input
                placeholder="Procure por ID ou Categoria"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
          {answers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade de perguntas</TableHead>
                <TableHead>Responder até</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {answers.map((answer, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{answer.form.name}</TableCell>
                  <TableCell className="font-medium">{answer.form.category}</TableCell>
                  <TableCell className="font-medium">{answer.form.questions? answer.form.questions.length : 0} Perguntas</TableCell>
                  <TableCell className="font-medium">{formatDate(answer.form.createdAt)}</TableCell>
                  <TableCell>
                      <div className='flex gap-1'>
                       <Link to={`/forms/${answer.form.id}/respostas/${answer.id}`}>
                          <Button variant="ghost" className='p-1 opacity-70'>
                            <ClipboardPen /> 
                          </Button>
                        </Link>
                        
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          ): (<NotFound name='Nenhum formulário encontrado.'/>)}
          <Pagination name={`formularios/`} filterPage={filterPage} totalUsersPage={totalFormsPage} />
          </>
          )}
        </CardContent>
      </Card>
    )
}

export default FormsToAnswerTable;
