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
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
} from "lucide-react"
import {Question} from '@/types/User'
import ApiService from '@/services/ApiService'
import { DialogDescription } from '@radix-ui/react-dialog';

import NotFound from './NotFound'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useParams } from 'react-router-dom';

const QuestionsTable = () => {
    const { id } = useParams(); 

    const apiService = new ApiService();
    const apiEndpoint = "private/questions"
    const apiFormsEndpoint = "private/forms"

    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionTypes, setQuestionTypes] = useState<string[]>([]);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const formsResponse = await apiService.get(`${apiFormsEndpoint}/${id}`);
                const types = await apiService.get(`${apiEndpoint}/types`);
                setQuestions(formsResponse.data.questions)
                setQuestionTypes(types.data)

            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchForms();
    }, []);
    
    const [searchTerm, setSearchTerm] = useState('')
    const [newQuestion, setNewQuestion] = useState({ id: 0, title: '', alternatives: "", type: "", form: id})
    const [selectedQuestion, setSelectedQuestion] = useState({ id: 0, title: '', alternatives: "", type: "", form: id})
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSelect = (question: Question) => {
        setSelectedQuestion({
            id: question.id,
            title: question.title,
            alternatives: question.alternatives,
            type: question.type,
            form: id
        });
    };

    const filteredForms = (questions) ? questions.filter(question =>
        (String(question.id)?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (question.title?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || 
        (question.alternatives?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) || 
        (question.type?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    ): [];

    const handleAddForm = (e: React.FormEvent) => {
        setIsLoading(true);
        e.preventDefault()
        apiService.post(apiEndpoint, newQuestion)

        setIsLoading(false);
    }

    const handleUpdateForm = (e: React.FormEvent) => {
        e.preventDefault()
        apiService.put(`${apiEndpoint}/${selectedQuestion.id}`, selectedQuestion)
    }

    const handleRemoveForm = (e: React.FormEvent) => {
        e.preventDefault()
        apiService.delete(`${apiEndpoint}/${selectedQuestion.id}`)
    }

    return (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Perguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end items-center mb-6">
              <div className="flex items-center flex-1 max-w-lg">
                <Input
                  placeholder="Procure por ID, Título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mr-2"
                />
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default">
                        <Plus /> Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddForm} className="space-y-4">
                        <div>
                            <Label htmlFor="title">Título</Label>
                            <Input
                            id="title"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                            required
                            />
                        </div>

                        <div>
                            <Label htmlFor="alternatives">Alternativas</Label>
                            <Input
                            id="alternatives"
                            value={newQuestion.alternatives}
                            onChange={(e) => setNewQuestion({...newQuestion, alternatives: e.target.value})}
                            required
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">Tipo</Label>
                            <Select
                            onValueChange={(type) => {setNewQuestion({...newQuestion, type})}}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Escolha um tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    {questionTypes.map((type) => (
                                        <SelectItem value={type}>{type}</SelectItem>
                                    ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>


                      <div className='flex justify-end'>
                        {isLoading? (<LoaderCircle className="animate-spin" />)
                        :
                        (<Button type="submit">Adicionar</Button>)}
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
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
            {filteredForms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Alternativas</TableHead>
                    <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.id}</TableCell>
                    <TableCell className="font-medium">{question.type}</TableCell>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell className="font-medium">{question.alternatives}</TableCell>

                    <TableCell>
                        <div className='flex gap-1'>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleFormSelect(question)}}>
                                        <Pen />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Atualizar Formulário</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdateForm} className="space-y-4">
                                        <div>
                                            <Label htmlFor="id">ID</Label>
                                            <Input
                                            disabled
                                            id="id"
                                            value={selectedQuestion.id}
                                            onChange={(e) => setSelectedQuestion({...selectedQuestion, id: Number(e.target.value)})}
                                            required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="title">Título</Label>
                                            <Input
                                            id="title"
                                            value={selectedQuestion.title}
                                            onChange={(e) => setSelectedQuestion({...selectedQuestion, title: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="alternatives">Alternativas</Label>
                                            <Input
                                            id="alternatives"
                                            value={selectedQuestion.alternatives}
                                            onChange={(e) => setSelectedQuestion({...selectedQuestion, alternatives: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="type">Tipo</Label>
                                            <Select
                                            onValueChange={(type) => {setSelectedQuestion({...selectedQuestion, type})}}
                                            >
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Escolha um tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                    {questionTypes.map((type) => (
                                                        <SelectItem value={type}>{type}</SelectItem>
                                                    ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
        
                            
                                        <div className='flex justify-end'>
                                            <Button type="submit">Atualizar</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleFormSelect(question)}}>
                                        <X />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Excluir Formulário</DialogTitle>
                                        <DialogDescription>Tem certeza que deseja excluir?</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleRemoveForm} className="space-y-4">
                                        <div>
                                            <Label htmlFor="id">ID</Label>
                                            <Input
                                            disabled
                                            id="id"
                                            value={selectedQuestion.id}
                                            onChange={(e) => setSelectedQuestion({...selectedQuestion, id: Number(e.target.value)})}
                                            required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="title">Título</Label>
                                            <Input
                                            disabled
                                            id="title"
                                            value={selectedQuestion.title}
                                            onChange={(e) => setSelectedQuestion({...selectedQuestion, title: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div className='flex justify-end'>
                                            <Button type="submit" className='bg-red-800'>Excluir</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ): (<NotFound name='Formulário' />)}
            <div className="flex justify-between mt-4">
              <Button variant="outline" disabled size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <span>Página 1 de 1</span>
              <Button variant="outline" disabled size="sm">
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
    )
}

export default QuestionsTable;
