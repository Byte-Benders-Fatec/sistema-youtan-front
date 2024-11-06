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
  ChevronLeft, 
  ChevronRight,
} from "lucide-react"
import ApiService from '@/services/ApiService'
import {Team} from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import { DialogDescription } from '@radix-ui/react-dialog';

import NotFound from './NotFound'

import Pagination from './Pagination'


const TeamsTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/teams"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;

    const [teams, setTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('')
    const [newTeam, setNewTeam] = useState({ id: 0, name: ''})
    const [selectedTeam, setSelectedTeam] = useState({ id: 0, name: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [teamAddError, setTeamAddError] = useState("")
    const [filterPage, setFilterPage] = useState(page)
    const [totalTeamsPage, setTotalTeamsPage] = useState(1)
    

    useEffect(() => {
        const fetchTeams = async () => {
          setIsInitialLoading(true);
            try {
              const [teamsResponse] = await Promise.all([
                apiService.get(apiEndpoint),
                apiService.get(`${apiEndpoint}`, {"take": 5, "page": page}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setTeams(Array.isArray(teamsResponse.data.teams) ? teamsResponse.data.teams : []);
              setTotalTeamsPage(teamsResponse.data.total? Math.ceil(teamsResponse.data.total / 5) : 1)
            } catch (error) {
                console.error('Error fetching teams:', error);
                setTeams([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchTeams();
    }, []);
    
    const handleTeamSelect = (team: Team) => {
        setSelectedTeam({ ...team});
    };

    const filteredTeams = teams.length > 0 ? teams.filter(team =>
    [team.id.toString(), team.name].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    const handleAddTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.post(apiEndpoint, newTeam),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error)
        } 

        setTeams(prevTeams => Array.isArray(prevTeams) ? [...prevTeams, response.data] : [response.data]);
        setAddIsOpen(false);
        setNewTeam({ id: 0, name: ''});
      } catch (error: any) {
        setTeamAddError(error.message || "An error occurred. Please try again.")
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.put(`${apiEndpoint}/${selectedTeam.id}`, selectedTeam),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setTeams(prevTeams => 
          Array.isArray(prevTeams) 
            ? prevTeams.map(team => team.id === selectedTeam.id ? response.data : team)
            : [response.data]
        )
        setUpdateIsOpen(false);
      } catch (error: any) {
          console.error("Erro ao adicionar time! Tente novamente...");
      } finally {
        setIsLoading(false);
      }
    };

    const handleRemoveTeam = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const [response] = await Promise.all([
          apiService.delete(`${apiEndpoint}/${selectedTeam.id}`),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);
        if (response.data.error) {
          throw new Error(response.data.error)
        }

        setTeams(prevTeams => 
          Array.isArray(prevTeams) 
            ? prevTeams.filter(team => team.id !== selectedTeam.id)
            : []
        )
      } catch (error: any) {
        console.log("Erro ao excluir time! Tente novamente...");
        
      } finally {
        setIsLoading(false);
      }
    };

    return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Times</CardTitle>
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
              placeholder="Procure por ID ou Nome"
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
                  <DialogTitle>Adicionar Novo Time</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTeam} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Time</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
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
                      newTeam.name !== "" ? (
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
        {filteredTeams.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team, idx) => (
              <TableRow key={idx}>
                <TableCell>{team.id}</TableCell>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>
                    <div className='flex gap-1'>
                      <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleTeamSelect(team), setUpdateIsOpen(true)}}>
                        <Pen />
                      </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleTeamSelect(team)}}>
                                    <X />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Excluir Time</DialogTitle>
                                    <DialogDescription>Tem certeza que deseja excluir?</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRemoveTeam} className="space-y-4">
                                    <div>
                                        <Label htmlFor="id">ID</Label>
                                        <Input
                                        disabled
                                        id="id"
                                        value={selectedTeam.id}
                                        onChange={(e) => setSelectedTeam({...selectedTeam, id: Number(e.target.value)})}
                                        required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Nome</Label>
                                        <Input
                                        disabled
                                        id="name"
                                        value={selectedTeam.name}
                                        onChange={(e) => setSelectedTeam({...selectedTeam, name: e.target.value})}
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
                    <DialogTitle>Atualizar Time</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateTeam} className="space-y-4">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input
                        disabled
                        id="id"
                        value={selectedTeam.id}
                        onChange={(e) => setSelectedTeam({...selectedTeam, id: Number(e.target.value)})}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                        id="name"
                        value={selectedTeam.name}
                        onChange={(e) => setSelectedTeam({...selectedTeam, name: e.target.value})}
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
        ): (<NotFound name='Nenhum time encontrado.'/>)}
        <Pagination name="usuarios" filterPage={filterPage} totalUsersPage={totalTeamsPage} />
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

export default TeamsTable;
