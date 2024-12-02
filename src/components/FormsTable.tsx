import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { List, LoaderCircle, Pen, Plus, X } from "lucide-react"
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
import {DefaultForm, Form, Team} from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
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
import { Link } from 'react-router-dom'
import Pagination from './Pagination'


const FormsTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/forms"
    const apiTeamEndpoint = "private/teams"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);

    const [teams, setTeams] = useState<Team[]>([]);
    
    const [forms, setForms] = useState<Form[]>([]);
    const [formCategories, setFormCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [newForm, setNewForm] = useState<Form>(DefaultForm)
    const [selectedForm, setSelectedForm] = useState<Form>(DefaultForm)
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [userFormError, setUserFormError] = useState("")
    const [filterPage, setFilterPage] = useState(page)
    const [totalFormsPage, setTotalFormsPage] = useState(1)


    useEffect(() => {
        const fetchForms = async () => {
            try {
                const [formsResponse, categoriesResponse, teamsResponse] = await Promise.all([
                  apiService.get(`${apiEndpoint}`, {"take": take, "page": page}),
                  apiService.get(`${apiEndpoint}/categories`),
                  apiService.get(`${apiTeamEndpoint}`),
                  new Promise(resolve => setTimeout(resolve, 1500))
                ])

                setForms(Array.isArray(formsResponse.data.forms) ? formsResponse.data.forms : []);
                setTotalFormsPage(formsResponse.data.total? Math.ceil(formsResponse.data.total / take) : 1)
                setFormCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
                setTeams(Array.isArray(teamsResponse.data.teams) ? teamsResponse.data.teams : []);
            } catch (error) {
              console.error('Erro ao buscar formulários:', error);
              setForms([]);
              setFormCategories([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchForms();
    }, []);

    const formatDate = (dataTimestamp: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dataTimestamp));
    }

    const filteredForms = forms.length > 0 ? forms.filter(form =>
        [form.id.toString(), form.name, form.category, formatDate(form.createdAt)]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    const handleFormSelect = (form: Form) => {
      setSelectedForm({ ...form })};

    const handleAddForm = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.post(apiEndpoint, newForm),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        if (response.data.error) {
          throw new Error(response.data.error)
        }

      setForms(prevForms => Array.isArray(prevForms) ? [...prevForms, response.data] : [response.data])
      setAddIsOpen(false);
      setNewForm(DefaultForm);
      } catch (error: any) {
        setUserFormError(error.message || "Ocorreu um erro! Tente novamente...");
      } finally {
        setIsLoading(false);
      }
    }

    const handleUpdateForm = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.put(`${apiEndpoint}/${selectedForm.id}`, selectedForm),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        }

        setForms(prevForms => 
          Array.isArray(prevForms) 
            ? prevForms.map(form => form.id === selectedForm.id ? response.data : form)
            : [response.data]
        );
        setUpdateIsOpen(false);
      } catch (error: any) {
          console.error("Erro ao adicionar formulário! Tente novamente...");
      } finally {
        setIsLoading(false);
      }
    }

    const handleRemoveForm = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.delete(`${apiEndpoint}/${selectedForm.id}`),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        }

        setForms(prevForms => 
          Array.isArray(prevForms) 
            ? prevForms.filter(form => form.id !== selectedForm.id)
            : []
        );

      } catch (error: any) {
        console.log("Erro ao excluir formulário:", error);
        
      } finally {
        setIsLoading(false);
      }
    }

    return (
      <Card className='min-h-[70vh] flex flex-col'>
        <CardHeader>
          <CardTitle className='text-2xl'>Formulários</CardTitle>
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
              <Dialog open={addIsOpen} onOpenChange={setAddIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                      <Plus /> Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Formulário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddForm} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Formulário</Label>
                      <Input
                        id="name"
                        value={newForm.name}
                        onChange={(e) => setNewForm({...newForm, name: e.target.value})}
                        required
                      />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição do Formulário</Label>
                      <Input
                        id="description"
                        value={newForm.description}
                        onChange={(e) => setNewForm({...newForm, description: e.target.value})}
                        required
                      />
                  </div>

                  <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                      onValueChange={(category) => {setNewForm({...newForm, category})}}
                      >
                          <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Escolha uma Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectGroup>
                              {formCategories.map((category, idx) => (
                                  <SelectItem key={idx} value={category}>{category}</SelectItem>
                              ))}
                              </SelectGroup>
                          </SelectContent>
                      </Select>
                    </div>

                    <div>
                        <Label htmlFor="team">Time</Label>
                        <Select
                          onValueChange={(teamId) => {
                            const newTeam = teams.find(team => team.id === Number(teamId))
                            if (newTeam) {
                              setNewForm({
                                ...newForm,
                                team: { id: newTeam.id, name: newTeam.name }
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            {teams.length > 0 ? (
                              <SelectValue placeholder="Escolha um time" />
                            ) : (
                              <SelectValue placeholder="Nenhum time criado!" />
                            )}
                          </SelectTrigger>
                          {teams.length > 0 && (
                            <SelectContent>
                              <SelectGroup>
                                {teams.map((team) => (
                                  <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
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
                        newForm.category !== "" ? (
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
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Quantidade de perguntas</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Disponível até</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form, idx) => (
                <TableRow key={idx}>
                  <TableCell>{form.id}</TableCell>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell className="font-medium">{form.category}</TableCell>
                  <TableCell className="font-medium">{form.questions? form.questions.length : 0} Perguntas</TableCell>
                  <TableCell className="font-medium">{formatDate(form.createdAt)}</TableCell>
                  <TableCell className="font-medium">{formatDate(form.createdAt)}</TableCell>
                  <TableCell>
                      <div className='flex gap-1'>
                        <Link to={`/formularios/${form.id}`}>
                          <Button variant="ghost" className='p-1 opacity-70'>
                            <List />
                          </Button>
                        </Link>

                      <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleFormSelect(form), setUpdateIsOpen(true)}}>
                        <Pen />
                      </Button>
                          
                      <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleFormSelect(form)}}>
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
                                    value={selectedForm.id}
                                    onChange={(e) => setSelectedForm({...selectedForm, id: Number(e.target.value)})}
                                    required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Categoria</Label>
                                    <Input
                                    disabled
                                    id="category"
                                    value={selectedForm.category}
                                    onChange={(e) => setSelectedForm({...selectedForm, category: e.target.value})}
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
                  <DialogTitle>Atualizar Formulário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateForm} className="space-y-4">
                  <div>
                      <Label htmlFor="id">ID</Label>
                      <Input
                      disabled
                      id="id"
                      value={selectedForm.id}
                      onChange={(e) => setSelectedForm({...selectedForm, id: Number(e.target.value)})}
                      required
                      />
                  </div>

                  <div>
                    <Label htmlFor="name">Nome do Formulário</Label>
                      <Input
                        id="name"
                        value={selectedForm.name}
                        onChange={(e) => setSelectedForm({...selectedForm, name: e.target.value})}
                        required
                      />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição do Formulário</Label>
                      <Input
                        id="description"
                        value={selectedForm.description}
                        onChange={(e) => setSelectedForm({...selectedForm, description: e.target.value})}
                        required
                      />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={selectedForm.category}
                    onValueChange={(category) => setSelectedForm({...selectedForm, category})}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Escolha uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            {formCategories.map((form, idx) => (
                                <SelectItem key={idx} value={form}>{form}</SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
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
                    {isLoading? (
                      <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                    :
                    (<Button type="submit">Atualizar</Button>)}
                  </div>
              </form>
            </DialogContent>
          </Dialog>

          </Table>
          ): (<NotFound name='Nenhum formulário encontrado.'/>)}
          <Pagination name="formularios" filterPage={filterPage} totalUsersPage={totalFormsPage} />
          </>
          )}
        </CardContent>
      </Card>
    )
}

export default FormsTable;
