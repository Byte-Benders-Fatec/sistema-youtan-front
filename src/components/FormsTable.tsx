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

    const handleAddForm = (e: React.FormEvent) => {
        setIsLoading(true);
        e.preventDefault()
        apiService.post(apiEndpoint, newForm)

        setIsLoading(false);
    }

    const handleUpdateForm = (e: React.FormEvent) => {
        e.preventDefault()
        apiService.put(`${apiEndpoint}/${selectedForm.id}`, selectedForm)
    }

    const handleRemoveForm = (e: React.FormEvent) => {
        e.preventDefault()
        apiService.delete(`${apiEndpoint}/${selectedForm.id}`)
    }

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
                <Dialog>
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
                                {formCategories.map((category) => (
                                    <SelectItem value={category}>{category}</SelectItem>
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow>
                    <TableCell>{form.id}</TableCell>
                    <TableCell className="font-medium">{form.category}</TableCell>

                    <TableCell>
                        <div className='flex gap-1'>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleFormSelect(form)}}>
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
                                            value={selectedForm.id}
                                            onChange={(e) => setSelectedForm({...selectedForm, id: Number(e.target.value)})}
                                            required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Categoria</Label>
                                            <Input
                                            id="category"
                                            value={selectedForm.category}
                                            onChange={(e) => setSelectedForm({...selectedForm, category: e.target.value})}
                                            required
                                            />
                                        </div>
        
                            
                                        <div className='flex justify-end'>
                                            <Button type="submit">Atualizar</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            

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

export default FormsTable;
