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
import {Form} from '@/types/User'
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

const FormsTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/forms"
    


    const [forms, setForms] = useState<Form[]>([]);
    const [formCategories, setFormCategories] = useState<string[]>([]);


    useEffect(() => {
        const fetchForms = async () => {
            try {
                const formsResponse = await apiService.get(apiEndpoint);
                const categoriesResponse = await apiService.get(`${apiEndpoint}/categories`);
                setForms(formsResponse.data)
                setFormCategories(categoriesResponse.data)

            } catch (error) {
                console.error('Error fetching forms:', error);
            }
        };

        fetchForms();
    }, []);
    
    const [searchTerm, setSearchTerm] = useState('')
    const [newForm, setNewForm] = useState({ id: 0, category: ''})
    const [selectedForm, setSelectedForm] = useState({  id: 0, category: ''})
    const [isLoading, setIsLoading] = useState(false);

    const handleFormSelect = (form: Form) => {
        setSelectedForm({
            id: form.id,
            category: form.category
        });
    };

    const filteredForms = (forms.length > 0) ? forms.filter(form =>
        (String(form.id)?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (form.category?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) 
    ): [];

    const handleAddForm = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.post(apiEndpoint, newForm);
        if (response.data.error) {
          throw new Error()
        } else {
          const form = response.data;
          forms.push(
            {
              id: form.id,
              category: form.category,
              questions: form.questions
            }
          );
        }

      } catch (error: any) {
        if (error.status == 400) {
          console.log("Preencha todos os campos.");
        } else {
          console.log("Tente novamente mais tarde.");
        }
        
      } finally {
          setTimeout(() => {
            setIsLoading(false);
            setAddIsOpen(false);
        }, 1500);
      }
    }

    const handleUpdateForm = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.put(`${apiEndpoint}/${selectedForm.id}`, selectedForm);
        if (response.data.error) {
          throw new Error()
        } else {
          const updatedForm = response.data;
          const formIdx = forms.findIndex(form =>  form.id === selectedForm.id);
          forms[formIdx] = updatedForm;
        }

      } catch (error: any) {
          console.error("Erro ao adicionar formulário! Tente novamente...");

      } finally {
          setTimeout(() => {
            setIsLoading(false);
            setUpdateIsOpen(false);
        }, 1500);
      }
    }

    const handleRemoveForm = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.delete(`${apiEndpoint}/${selectedForm.id}`);
        if (response.data.error) {
          throw new Error()
        } else {
          const formIdx = forms.findIndex(form =>  form.id === selectedForm.id)
          forms.splice(formIdx, 1);
        }

      } catch (error: any) {
        console.log(error);
        
      } finally {
          setTimeout(() => {
            setIsLoading(false);
        }, 1500);
      }
    }

    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);

    return (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Formulários</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade de perguntas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{form.id}</TableCell>
                    <TableCell className="font-medium">{form.category}</TableCell>
                    <TableCell className="font-medium">{form.questions? form.questions.length : 0} Pergunta(s)</TableCell>

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

export default FormsTable;
