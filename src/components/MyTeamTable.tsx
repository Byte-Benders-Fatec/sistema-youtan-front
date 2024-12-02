import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle } from "lucide-react"
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
  Download, 
} from "lucide-react"
import ApiService from '@/services/ApiService'
import { Answer, DefaultAnswer } from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import NotFound from './NotFound'
import Pagination from './Pagination'

const MyTeamTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);
    const isAdmin = localStorage.getItem(import.meta.env.VITE_AUTH_COOKIE_NAME) === "Admin";

    const [answers, setAnswers] = useState<Answer[]>([]);
     const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState<Answer>(DefaultAnswer);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [filterPage, setFilterPage] = useState(page)
    const [totalAnswersPage, setTotalAnswersPage] = useState(1)

    useEffect(() => {
        const fetchAnswers = async () => {
          setIsInitialLoading(true);
            try {
              const [answersResponse] = await Promise.all([
                apiService.get(`${apiEndpoint}/myTeam`, {"take": take, "page": page}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setAnswers(Array.isArray(answersResponse.data.answers) ? answersResponse.data.answers : []);
              setTotalAnswersPage(answersResponse.data.total? Math.ceil(answersResponse.data.total / take) : 1);
            } catch (error) {
                console.error('Error fetching answers:', error);
                setAnswers([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchAnswers();
    }, []);
    
    const handleAnswerSelect = (answer: Answer) => {
        setSelectedAnswer({ ...answer});
    };

    const filteredAnswers = answers.length > 0 ? answers.filter(answer =>
    [answer.id.toString(), answer.user.name, answer.user.team.name, answer.form.category, answer.userAnswers?.toString()].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Respostas dos Formulários do Time</CardTitle>
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
              placeholder="Procure por ID, Nome, Formulário..."
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
        {filteredAnswers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin &&<TableHead>ID</TableHead>}
              <TableHead>Nome</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Formulário</TableHead>
              <TableHead>Perguntas e Respostas</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnswers.map((answer, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{answer.user.name}</TableCell>
                <TableCell className="font-medium">{answer.user.team.name}</TableCell>
                <TableCell className="font-medium">{answer.form.category}</TableCell>
                <TableCell className="font-medium">{answer.userAnswers.join(", ")}</TableCell>
                <TableCell className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${answer.userHasAnswered? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {answer.userHasAnswered? "Respondido" : "Não Respondido"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        ): (<NotFound name='Nenhuma resposta de formulário encontrada.'/>)}
          <Pagination name="meuTime" filterPage={filterPage} totalUsersPage={totalAnswersPage} />
          </>
      )}
      </CardContent>
    </Card>
  )
}

export default MyTeamTable;
