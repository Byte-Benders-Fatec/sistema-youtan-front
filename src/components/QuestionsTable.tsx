import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle, Pen, Plus, Trash2Icon, X } from "lucide-react"
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
import { useSearchParams  } from 'react-router-dom'



import Pagination from './Pagination'


const QuestionsTable = () => {
    const { id } = useParams(); 

    const apiService = new ApiService();
    const apiEndpoint = "private/questions"
    const apiFormsEndpoint = "private/forms"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [questionTypes, setQuestionTypes] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [newQuestion, setNewQuestion] = useState({ id: 0, title: '', alternatives: [""], type: "", form: id})
    const [selectedQuestion, setSelectedQuestion] = useState({ id: 0, title: '', alternatives: [""], type: "", form: id})
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [questionAddError, setQuestionAddError] = useState("");
    const [filterPage, setFilterPage] = useState(page)
    const [totalQuestionsPage, setTotalQuestionsPage] = useState(1)

    useEffect(() => {
      const fetchForms = async () => {
        try {
          const [questionsResponse, types] = await Promise.all([
            apiService.get(`${apiFormsEndpoint}/${id}`),
            apiService.get(`${apiEndpoint}`, {"take": 5, "page": page}),
            apiService.get(`${apiEndpoint}/types`),
            new Promise(resolve => setTimeout(resolve, 1500))
          ]);

          setQuestions(Array.isArray(questionsResponse.data.questions) ? questionsResponse.data.questions : []);
          setTotalQuestionsPage(questionsResponse.data.total? Math.ceil(questionsResponse.data.total / 5) : 1)
          setQuestionTypes(Array.isArray(types.data) ? types.data : []);
        } catch (error) {
          console.error('Error fetching questions:', error);
          setQuestions([]);
          setQuestionTypes([]);
        } finally {
          setIsInitialLoading(false);
        }
    };

    fetchForms();
    }, []);

    useEffect(() => {
      if (selectedQuestion.type === "Texto Longo") {
        setSelectedQuestion((prev) => ({
          ...prev,
          alternatives: [""]
        }));
      }
    }, [selectedQuestion.type]);

    const handleQuestionSelect = (question: Question) => {
      setSelectedQuestion({
        ...question,
        form: id
      });
    };

    const filteredForms = questions.length > 0 ? questions.filter(question =>
      [question.id.toString(), question.type, question.alternatives.toString(), question.title]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

  const handleAddAlternative = () => {
    setNewQuestion({
        ...newQuestion,
        alternatives: [...newQuestion.alternatives, ""]
    });
  };

  const handleAlternativeChange = (index: number, value: string) => {
    const updatedAlternatives = [...newQuestion.alternatives];
    updatedAlternatives[index] = value;
    setNewQuestion({ ...newQuestion, alternatives: updatedAlternatives });
  };

  const handleRemoveAlternative = (index: number) => {
    const updatedAlternatives = newQuestion.alternatives.filter((_, i) => i !== index);
    setNewQuestion({ ...newQuestion, alternatives: updatedAlternatives });
  };

  const handleAddUpdatedAlternative = () => {
    setSelectedQuestion({
        ...selectedQuestion,
        alternatives: [...selectedQuestion.alternatives, ""]
    });
  };

  const handleUpdatedAlternativeChange = (index: number, value: string) => {
    const updatedAlternatives = [...selectedQuestion.alternatives];
    updatedAlternatives[index] = value;
    setSelectedQuestion({ ...selectedQuestion, alternatives: updatedAlternatives });
  };

  const handleUpdatedRemoveAlternative = (index: number) => {
    const updatedAlternatives = selectedQuestion.alternatives.filter((_, i) => i !== index);
    setSelectedQuestion({ ...selectedQuestion, alternatives: updatedAlternatives });
  };

    const handleAddQuestion = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        const [response] = await Promise.all([
          apiService.post(apiEndpoint, newQuestion),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        }

      setQuestions(prevQuestions => Array.isArray(prevQuestions) ? [...prevQuestions, response.data] : [response.data])
      setAddIsOpen(false);
      setNewQuestion({id: 0, title: "", alternatives: [""], type: "", form: id})
      } catch (error: any) {
        setQuestionAddError(error.message || "An error occurred. Please try again.")
      } finally {
        setIsLoading(false);
      }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const [response] = await Promise.all([
        apiService.put(`${apiEndpoint}/${selectedQuestion.id}`, selectedQuestion),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      setQuestions(prevQuestions => 
        Array.isArray(prevQuestions) 
          ? prevQuestions.map(question => question.id === selectedQuestion.id ? response.data : question)
          : [response.data]
      );
      setUpdateIsOpen(false);
    } catch (error: any) {
        console.error("Erro ao adicionar questão! Tente novamente...");
    } finally {
      setIsLoading(false);
    }
  }

  const handleRemoveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const [response] = await Promise.all([
        apiService.delete(`${apiEndpoint}/${selectedQuestion.id}`),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      if (response.data.error) {
        throw new Error(response.data.error)
      }

      setQuestions(prevQuestions => 
        Array.isArray(prevQuestions) 
          ? prevQuestions.filter(question => question.id !== selectedQuestion.id)
          : []
      );

    } catch (error: any) {
      console.log("Erro ao remover questão:", error);
    } finally {
      setIsLoading(false);
    }
  }

    return (
      <Card className='min-h-[70vh] flex flex-col'>
        <CardHeader>
          <CardTitle className='text-2xl'>Perguntas do Formulário ID: {id}</CardTitle>
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
                placeholder="Procure por ID, Título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mr-2"
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" disabled={questions.length >= 20}>
                      <Plus /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Pergunta</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddQuestion} className="space-y-4">
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
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                        onValueChange={(type) => {setNewQuestion({...newQuestion, type})}}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Escolha um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {questionTypes.map((type, idx) => (
                                    <SelectItem key={idx} value={type}>{type}</SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                      </div>

                      {newQuestion.type !== "Texto Longo" && newQuestion.type !== "" &&
                        <div>
                          <div className='flex items-center justify-between text-center'>
                            <Label htmlFor="alternatives">Alternativas </Label>
                            <Button onClick={handleAddAlternative} variant="ghost" className='p-1 opacity-70' disabled={newQuestion.alternatives.length >= 5} >
                              <Plus />
                            </Button>
                            
                          </div>

                        {newQuestion.alternatives.map((alternative, index) => (
                          <div className='flex mb-3' key={index}>
                            <Input
                              id={`alternative-${index}`}
                              placeholder={`Alternativa ${index+1}`}
                              value={alternative}
                              onChange={(e) => handleAlternativeChange(index, e.target.value)}
                              required
                            />
                            <Button type="button" onClick={() => {handleRemoveAlternative(index)}} variant="ghost" className='p-1 opacity-70' disabled={newQuestion.alternatives.length == 1}>
                              <Trash2Icon  />
                            </Button>
                          </div>
                        ))}
                        </div>
                      }

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
                        newQuestion.title.length > 0 && newQuestion.type !== "" ? (
                          <Button type="submit">Adicionar</Button>
                        ) : (
                          <Button disabled type="submit">Adicionar</Button>
                        )
                      )}
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
                  <TableCell className="font-medium">{question.alternatives.join(", ")}</TableCell>

                  <TableCell>
                      <div className='flex gap-1'>
                      <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleQuestionSelect(question), setUpdateIsOpen(true)}}>
                        <Pen />
                      </Button>

                          <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleQuestionSelect(question)}}>
                                  <X />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Excluir Formulário</DialogTitle>
                                    <DialogDescription>Tem certeza que deseja excluir?</DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={handleRemoveQuestion} className="space-y-4">
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

                                      <div className='flex justify-end gap-1'>
                                        <DialogClose asChild>
                                        {isLoading? (<Button disabled type="button" variant="secondary">
                                          Cancelar
                                        </Button>) : (<Button type="button" variant="secondary">
                                          Cancelar
                                        </Button>)}
                                        </DialogClose>
                                        {isLoading? (
                                          <Button type="submit" className='bg-red-800' disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                                        :
                                        (<Button type="submit" className='bg-red-800'>Excluir</Button>)}
                                      </div>
                                  </form>
                              </DialogContent>
                          </Dialog>
                          
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            <Dialog open={updateIsOpen} onOpenChange={setUpdateIsOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle>Atualizar Pergunta</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpdateQuestion} className="space-y-4">
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
                        <Label htmlFor="type">Tipo</Label>
                        <Select
                        value={selectedQuestion.type}
                        onValueChange={(type) => {setSelectedQuestion({...selectedQuestion, type})}}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Escolha um tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {questionTypes.map((type, idx) => (
                                    <SelectItem key={idx} value={type}>{type}</SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                      </div>

                      {selectedQuestion.type !== "Texto Longo" && selectedQuestion.type !== "" &&
                        <div>
                          <div className='flex items-center justify-between text-center'>
                            <Label htmlFor="alternatives">Alternativas </Label>
                            <Button onClick={handleAddUpdatedAlternative} variant="ghost" className='p-1 opacity-70' disabled={selectedQuestion.alternatives.length >= 5} >
                              <Plus />
                            </Button>
                            
                          </div>

                        {selectedQuestion.alternatives.map((alternative, index) => (
                          <div className='flex mb-3' key={index}>
                            <Input
                              id={`alternative-${index}`}
                              placeholder={`Alternativa ${index+1}`}
                              value={alternative}
                              onChange={(e) => handleUpdatedAlternativeChange(index, e.target.value)}
                              required
                            />
                            <Button type="button" onClick={() => handleUpdatedRemoveAlternative(index)} variant="ghost" className='p-1 opacity-70' disabled={selectedQuestion.alternatives.length == 1}>
                              <Trash2Icon  />
                            </Button>
                          </div>
                        ))}
                        </div>
                      }

          
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
          ): (<NotFound name='Nenhuma questão encontrada.'/>)}
          <Pagination name="usuarios" filterPage={filterPage} totalUsersPage={totalQuestionsPage} />
          <div className="flex justify-between mt-auto pt-4 border-t">
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
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default QuestionsTable;
