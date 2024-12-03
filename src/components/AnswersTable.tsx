import React, { useEffect, useState, useRef } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Eye, FileSymlink, LoaderCircle, Pen, Plus, View, X } from "lucide-react"
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
  DialogDescription,
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
import { Answer, DefaultAnswer, Form, User } from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import NotFound from './NotFound'
import Pagination from './Pagination'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select'

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Checkbox } from './ui/checkbox'
import FormAnswered from './ViewAnswers'
import { DialogActions } from '@mui/material'
import { DatePickerWithRange } from './ui/datepicker'
import { v4 as uuidv4 } from 'uuid';

const AnswersTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const apiUsersEndpoint = "private/users"
    const apiFormsEndpoint = "private/forms"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);
    const isAdmin = localStorage.getItem(import.meta.env.VITE_AUTH_COOKIE_NAME) === "Admin";

    const [answers, setAnswers] = useState<Answer[]>([]);
    const [forms, setForms] = useState<Form[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newAnswer, setNewAnswer] = useState<Answer>(DefaultAnswer);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState<Answer>(DefaultAnswer);
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [answerAddError, setAnswerAddError] = useState("")
    const [filterPage, setFilterPage] = useState(page)
    const [totalAnswersPage, setTotalAnswersPage] = useState(1)

    const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
      if (addIsOpen) {
        setSelectedAnswers([]);
      }
    }, [selectedAnswers])

    const handleCheckboxChange = (answer: Answer) => {
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          const newSelection = prev.filter(a => a !== answer)

          return newSelection
        } else if (prev.length < 2) {
          return [...prev, answer]
        }
        return prev
      })
    }
  
    const isCheckboxDisabled = (answer: Answer) => {
      return (!answer.userHasAnswered) || (selectedAnswers.length >= 2 && !selectedAnswers.includes(answer))
    }

    useEffect(() => {
        const fetchAnswers = async () => {
          setIsInitialLoading(true);
            try {
              const [answersResponse] = await Promise.all([
                apiService.get(`${apiEndpoint}`, {"take": take, "page": page, "from": from, "to": to}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setAnswers(Array.isArray(answersResponse.data.answers) ? answersResponse.data.answers : []);
              setTotalAnswersPage(answersResponse.data.total? Math.ceil(answersResponse.data.total / take) : 1);
              
              if (isAdmin){
                const [usersResponse, formsResponse] = await Promise.all([
                  apiService.get(`${apiUsersEndpoint}`),
                  apiService.get(`${apiFormsEndpoint}`)
                ]);
                setUsers(Array.isArray(usersResponse.data.users) ? usersResponse.data.users : []);
                setForms(Array.isArray(formsResponse.data.forms) ? formsResponse.data.forms : []);
              }
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

    const formatDate = (dataTimestamp: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dataTimestamp));
    }

    const filteredAnswers = answers.length > 0 ? answers.filter(answer =>
    [answer.id.toString(), answer.user.name, answer.user.team.name, answer.form.category, answer.form.name, formatDate(answer.updatedAt), (answer.userHasAnswered)? "Respondido" : "Não Respondido"].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    const handleAddAnswer = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      newAnswer.form.team = newAnswer.user.team;
      newAnswer.userToEvaluate = null;

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
        setNewAnswer(DefaultAnswer);
      } catch (error: any) {
        setAnswerAddError(error.message || "An error occurred. Please try again.")
      } finally {
        setIsLoading(false);
      }
    };

    const tabelaRef = useRef<HTMLTableElement>(null);
    const downloadPDF = async () => {
      setIsLoading(true);
      if (tabelaRef.current) {
        try {
          const canvas = await html2canvas(tabelaRef.current, {
            useCORS: true,
            scale: 2,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: "#fff",
          });
    
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
    
          const imgWidth = pdfWidth; // Ajusta para caber no PDF
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
          let position = 0; // Altura inicial da página
    
          // Divide o conteúdo em várias páginas
          while (position < imgHeight) {
            pdf.addImage(
              imgData,
              "PNG",
              0,
              -position, // Move para a parte correta do canvas
              imgWidth,
              imgHeight
            );
    
            position += pdfHeight; // Incrementa para a próxima página
    
            if (position < imgHeight) {
              pdf.addPage();
            }
          }
          pdf.save(`${uuidv4()}.pdf`);
          setIsLoading(false);
        } catch (error) {
          console.error("An error occurred. Please try again.");
        }
      }
    };

    const showFormAnswers = (answer: Answer) => {
      setIsModalOpen(true);
      setSelectedAnswers([answer]);
    }
    
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
                        <Label htmlFor="user">Usuário</Label>
                        <Select
                          onValueChange={(userId) => {
                            const newUser = users.find(user => user.id === Number(userId))
                            if (newUser) {
                              setNewAnswer({
                                ...newAnswer,
                                user: {
                                  id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, team: newUser.team, password: ''
                                }}
                              )
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            {users.length > 0 ? (
                              <SelectValue placeholder="Escolha um usuário" />
                            ) : (
                              <SelectValue placeholder="Nenhum usuário criado!" />
                            )}
                          </SelectTrigger>
                          {users.length > 0 && (
                            <SelectContent>
                              <SelectGroup>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          )}
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="form">Formulário</Label>
                        <Select
                          onValueChange={(formId) => {
                            const newForm = forms.find(form => form.id === Number(formId))
                            if (newForm) {
                              setNewAnswer({
                                ...newAnswer,
                                form: {
                                  id: newForm.id, name: newForm.name, description: newForm.description, category: newForm.category, team: newForm.team, createdAt: new Date()
                                }}
                              )
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            {forms.length > 0 ? (
                              <SelectValue placeholder="Escolha um formulário" />
                            ) : (
                              <SelectValue placeholder="Nenhum formulário criado!" />
                            )}
                          </SelectTrigger>
                          {forms.length > 0 && (
                            <SelectContent>
                              <SelectGroup>
                                {forms.map((form) => (
                                  <SelectItem key={form.id} value={form.id.toString()}>{form.name}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          )}
                        </Select>
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
                        newAnswer.user.name !== "" && newAnswer.form.name !== ""? (
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

            {selectedAnswers.length == 2 && 
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <View className="mr-2 h-4 w-4"></View>
                Comparar
              </Button>
              </>
            }
            <DatePickerWithRange from={from} to={to}/>
          </div>
        </div>
        {filteredAnswers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {isAdmin &&<TableHead>ID</TableHead>}
              <TableHead>Nome</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Formulário</TableHead>
              <TableHead>Respondido em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnswers.map((answer, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">
                <Checkbox
                  checked={selectedAnswers.includes(answer)}
                  onCheckedChange={() => handleCheckboxChange(answer)}
                  disabled={isCheckboxDisabled(answer)}
                />
              </TableCell>
                {isAdmin &&<TableCell>{answer.id}</TableCell>}
                <TableCell className="font-medium">{answer.user.name}</TableCell>
                <TableCell className="font-medium">{answer.form.team.name}</TableCell>
                <TableCell className="font-medium">{answer.form.name} - {answer.form.category}</TableCell>
                <TableCell className="font-medium">{(answer.userHasAnswered)? answer.updatedAt && formatDate(answer.updatedAt): "-"}</TableCell>
                <TableCell className="font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${answer.userHasAnswered? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {answer.userHasAnswered? "Respondido" : "Não Respondido"}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  <Button disabled={!answer.userHasAnswered} variant="ghost" className='p-1 opacity-70' onClick={() => showFormAnswers(answer)}>
                    <Eye /> 
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className={selectedAnswers.length == 2 ? "max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[100vh] overflow-y-auto justify-between" : ""}>
              <div className={selectedAnswers.length == 2 ? 'gap-3 md:block lg:flex' : ''} ref={tabelaRef}>
                {selectedAnswers.map((answer) => (
                  <FormAnswered answer={answer} />
                ))}
              </div>

              <DialogActions>

                <Button variant="outline" onClick={() => {setIsModalOpen(false)}}>
                  Fechar
                </Button>

                {isLoading? (
                  <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                  :
                <Button onClick={downloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
                }

              </DialogActions>
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
