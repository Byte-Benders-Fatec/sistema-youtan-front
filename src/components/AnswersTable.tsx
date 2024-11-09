import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle, Pen, Plus, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { 
  Filter, 
  Download, 
} from "lucide-react"
import ApiService from '@/services/ApiService'
import { Answer } from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import NotFound from './NotFound'

import Pagination from './Pagination'


const AnswersTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);
    const isAdmin = localStorage.getItem("is-auth") === "Admin";

    const [answers, setAnswers] = useState<Answer[]>([]);
    const [newAnswer, setNewAnswer] = useState({id: 0, userAnswers: [""], user: 0, form: 0});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState({id: 0, userAnswers: [""], user: 0, form: 0});
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [answerAddError, setAnswerAddError] = useState("")
    const [filterPage, setFilterPage] = useState(page)
    const [totalAnswersPage, setTotalAnswersPage] = useState(1)

    useEffect(() => {
        const fetchAnswers = async () => {
          setIsInitialLoading(true);
            try {
              const [answersResponse] = await Promise.all([
                apiService.get(`${apiEndpoint}`, {"take": take, "page": page}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setAnswers(Array.isArray(answersResponse.data.answers) ? answersResponse.data.answers : []);
              setTotalAnswersPage(answersResponse.data.total? Math.ceil(answersResponse.data.total / take) : 1)
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

    const handleAddAnswer = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.post(apiEndpoint, newAnswer),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        } 

        setAnswers(prevAnswers => Array.isArray(prevAnswers) ? [...prevAnswers, response.data] : [response.data]);
        setAddIsOpen(false);
        setNewAnswer({id: 0, userAnswers: [""], user: 0, form: 0});
      } catch (error: any) {
        setAnswerAddError(error.message || "An error occurred. Please try again.")
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateAnswer = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.put(`${apiEndpoint}/${selectedAnswer.id}`, selectedAnswer),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setAnswers(prevAnswers => 
          Array.isArray(prevAnswers) 
            ? prevAnswers.map(answer => answer.id === selectedAnswer.id ? response.data : answer)
            : [response.data]
        )
        setUpdateIsOpen(false);
      } catch (error: any) {
          console.error("Erro ao adicionar resposta! Tente novamente...");
      } finally {
        setIsLoading(false);
      }
    };

    const handleRemoveAnswer = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.delete(`${apiEndpoint}/${selectedAnswer.id}`),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        if (response.data.error) {
          throw new Error(response.data.error)
        }

        setAnswers(prevAnswers => 
          Array.isArray(prevAnswers) 
            ? prevAnswers.filter(answer => answer.id !== selectedAnswer.id)
            : []
        )
      } catch (error: any) {
        console.log("Erro ao excluir resposta! Tente novamente...");
        
      } finally {
        setIsLoading(false);
      }
    };

    return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Respostas dos Formulários</CardTitle>
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
            {isAdmin &&
              <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                      <Plus /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Resposta</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddAnswer} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Time</Label>
                      <Input
                        id="name"
                        value={newAnswer.userAnswers}
                        onChange={(e) => setNewAnswer({...newAnswer, userAnswers: e.target.value.split(",")})}
                        required
                      />
                    </div>


                    <div className='flex justify-end gap-1'>
                      <DialogClose asChild>
                      {isLoading? (<Button disabled type="button" variant="secondary">
                        Cancelar
                      </Button>) : (<Button type="button" variant="secondary">
                        Cancelar
                      </Button>)}
                      </DialogClose>
                      {isLoading ? (
                        <Button type="submit" disabled>
                          <LoaderCircle className="animate-spin" />Aguarde
                        </Button>
                      ) : (
                        !newAnswer.userAnswers ? (
                          <Button type="submit">Adicionar</Button>
                        ) : (
                          <Button disabled type="submit">Adicionar</Button>
                        )
                      )}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            }
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
                {isAdmin &&<TableCell>{answer.id}</TableCell>}
                <TableCell className="font-medium">{answer.user.name}</TableCell>
                <TableCell className="font-medium">{answer.user.team.name}</TableCell>
                <TableCell className="font-medium">{answer.form.category}</TableCell>
                <TableCell className="font-medium">{answer.userAnswers}</TableCell>
                <TableCell className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${answer.userHasAnswered? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {answer.userHasAnswered? "Respondido" : "Não Respondido"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Atualizar Resposta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateAnswer} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input
                        disabled
                        id="id"
                        value={selectedAnswer.id}
                        onChange={(e) => setSelectedAnswer({...selectedAnswer, id: Number(e.target.value)})}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                        id="name"
                        value={selectedAnswer.userAnswers}
                        onChange={(e) => setSelectedAnswer({...selectedAnswer, userAnswers: e.target.value.split(",")})}
                        required
                        />
                    </div>

        
                    <div className='flex justify-end gap-1'>
                      <DialogClose asChild>
                      {isLoading? (<Button disabled type="button" variant="secondary">
                        Cancelar
                      </Button>) : (<Button type="button" variant="secondary">
                        Cancelar
                      </Button>)}
                      </DialogClose>
                      {isLoading? (
                        <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                      :
                      (<Button type="submit">Atualizar</Button>)}
                    </div>
                </form>
            </DialogContent>
          </Dialog>

        </Table>
        ): (<NotFound name='Nenhuma resposta de formulário encontrada.'/>)}
          <Pagination name="dashboard" filterPage={filterPage} totalUsersPage={totalAnswersPage} />
          </>
      )}
      </CardContent>
    </Card>
  )
}

export default AnswersTable;
