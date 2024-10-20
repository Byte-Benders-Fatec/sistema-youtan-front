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
import { DialogDescription } from '@radix-ui/react-dialog';

import NotFound from './NotFound'

const TeamsTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/teams"


    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teamsResponse = await apiService.get(apiEndpoint);
                setTeams(teamsResponse.data)
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };

        fetchTeams();
    }, []);
    
    const [searchTerm, setSearchTerm] = useState('')
    const [newTeam, setNewTeam] = useState({ id: 0, name: ''})
    const [selectedTeam, setSelectedTeam] = useState({ id: 0, name: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [addIsOpen, setAddIsOpen] = useState(false);
    const [updateIsOpen, setUpdateIsOpen] = useState(false);

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam({
            id: team.id,
            name: team.name,
        });
    };

    const filteredTeams = (teams.length > 0) ? teams.filter(team =>
        (String(team.id)?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (team.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    ): [];

    const handleAddTeam = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.post(apiEndpoint, newTeam);
        if (response.data.error) {
          throw new Error()
        } else {
          const team = response.data;
          teams.push(
            {
              id: team.id,
              name: team.name
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
            setNewTeam({ id: 0, name: ''});
        }, 1500);
      }
    };

    const handleUpdateTeam = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.put(`${apiEndpoint}/${selectedTeam.id}`, selectedTeam);
        if (response.data.error) {
          throw new Error()
        } else {
          const updatedTeam = response.data;
          const teamIdx = teams.findIndex(team =>  team.id === selectedTeam.id);
          teams[teamIdx] = updatedTeam;
        }

      } catch (error: any) {
          console.error("Erro ao adicionar usuário! Tente novamente...");

      } finally {
          setTimeout(() => {
            setIsLoading(false);
            setUpdateIsOpen(false);
        }, 1500);
      }
    };

    const handleRemoveTeam = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.delete(`${apiEndpoint}/${selectedTeam.id}`);
        if (response.data.error) {
          throw new Error()
        } else {
          const teamIdx = teams.findIndex(team =>  team.id === selectedTeam.id);
          teams.splice(teamIdx, 1);
        }

      } catch (error: any) {
        console.log(error);
        
      } finally {
          setTimeout(() => {
            setIsLoading(false);
        }, 1500);
      }
    };

    return (
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Times</CardTitle>
          </CardHeader>
          <CardContent>
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
                          {isLoading? (
                            <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
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
            ): (<NotFound name='time' />)}
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

export default TeamsTable;
