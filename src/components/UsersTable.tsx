import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle, Plus, UserPen, UserRoundPlus, UserRoundX } from "lucide-react"
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
  TrashIcon,
  Edit,
} from "lucide-react"
import ApiService from '@/services/ApiService'
import {User, Team} from '@/types/User'
import { DialogDescription } from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import NotFound from './NotFound'

const UsersTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/users"
    const apiTeamEndpoint = "private/teams"

    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUsersRoles] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersResponse = await apiService.get(apiEndpoint);
                const rolesResponse = await apiService.get(`${apiEndpoint}/roles`);
                const teamsResponse = await apiService.get(apiTeamEndpoint);
                setUsers(usersResponse.data);
                setUsersRoles(rolesResponse.data)
                setTeams(teamsResponse.data)
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);
    
    const [searchTerm, setSearchTerm] = useState('')
    const [newUser, setNewUser] = useState({ id: 0, name: '', email: '', role: '', team: {id: 0, name: ""} })
    const [selectedUser, setSelectedUser] = useState({ id: 0, name: '', email: '', role: '', team: {id: 0, name: ""} })
    const [isLoading, setIsLoading] = useState(false);
    const [userAddError, setUserAddError] = React.useState("");

    const handleUserSelect = (user: User) => { 
        setSelectedUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            team: user.team,
        });
    };

    const filteredUsers = (users.length > 0) ? users.filter(user =>
        (String(user.id)?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
        (user.team?.name?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
    ): [];

    const handleAddUser = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);
        setUserAddError("");

        const response = await apiService.post(apiEndpoint, newUser);
        if (response.data.error) {
          throw new Error()
        } else {
          const user = response.data;
          users.push(
            {id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              team: user.team}
          );
        }

      } catch (error: any) {
        if (error.status == 400) {
          setUserAddError("Preencha todos os campos.");
        } else {
          setUserAddError("Tente novamente mais tarde.");
        }
        
      } finally {
          setTimeout(() => {
            setIsLoading(false);
            setAddIsOpen(false);
        }, 1500);
      }
  };

    const handleUpdateUser = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.put(`${apiEndpoint}/${selectedUser.id}`, selectedUser);
        if (response.data.error) {
          throw new Error()
        } else {
          const updatedUser = response.data;
          const userIdx = users.findIndex(userr =>  userr.id === selectedUser.id);
          users[userIdx] = updatedUser;
        }

      } catch (error: any) {
          console.error("Erro ao adicionar usuário! Tente novamente...");

      } finally {
          setTimeout(() => {
            setIsLoading(false);
            setUpdateIsOpen(false);
        }, 1500);
      }
    }

    const handleRemoveUser = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        setIsLoading(true);

        const response = await apiService.delete(`${apiEndpoint}/${selectedUser.id}`);
        if (response.data.error) {
          throw new Error()
        } else {
          const userIdx = users.findIndex(userr =>  userr.id === selectedUser.id)
          users.splice(userIdx, 1);
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
            <CardTitle className='text-2xl'>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end items-center mb-6">
              <div className="flex items-center flex-1 max-w-lg">
                <Input
                  placeholder="Procure por ID, Nome, Cargo..."
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
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="role">Cargo</Label>
                        <Select
                        onValueChange={(role) => {setNewUser({...newUser, role})}}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Escolha um cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {userRoles.map((role, idx) => (
                                    <SelectItem key={idx} value={role}>{role}</SelectItem>
                                ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="team">Time</Label>
                        <Select
                        onValueChange={(teamId) => {
                            const newTeam = teams.find(team => team.id === Number(teamId));
                            if (newTeam) {
                              setNewUser({
                                ...newUser,
                                team: { id: newTeam.id, name: newTeam.name }
                              });
                            }
                          }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Escolha um time" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
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
            {filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.team.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${user.role === 'Admin' ? 'bg-green-100 text-green-800' :
                          user.role === 'Lider' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                        <div className='flex gap-1'>

                          <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleUserSelect(user), setUpdateIsOpen(true)}}>
                              <UserPen />
                          </Button>
                      
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className='p-1 opacity-70' onClick={() => {handleUserSelect(user)}}>
                                        <UserRoundX />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Excluir Usuário</DialogTitle>
                                        <DialogDescription>Tem certeza que deseja excluir?</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleRemoveUser} className="space-y-4">
                                        <div>
                                            <Label htmlFor="id">ID</Label>
                                            <Input
                                            disabled
                                            id="id"
                                            value={selectedUser.id}
                                            onChange={(e) => setSelectedUser({...selectedUser, id: Number(e.target.value)})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="name">Nome</Label>
                                            <Input
                                            disabled
                                            id="name"
                                            value={selectedUser.name}
                                            onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                            disabled
                                            id="email"
                                            type="email"
                                            value={selectedUser.email}
                                            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="role">Cargo</Label>
                                            <Input
                                            disabled
                                            id="role"
                                            value={selectedUser.role}
                                            onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                                            required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="team">Time</Label>
                                            <Input
                                            disabled
                                            id="team"
                                            value={selectedUser.team.name}
                                            onChange={(e) => setSelectedUser({...selectedUser, team: {id: 0, name: e.target.value}})}
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
                          <DialogTitle>Atualizar Usuário</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateUser} className="space-y-4">
                          <div>
                              <Label htmlFor="id">ID</Label>
                              <Input
                              disabled
                              id="id"
                              value={selectedUser.id}
                              onChange={(e) => setSelectedUser({...selectedUser, id: Number(e.target.value)})}
                              required
                              />
                          </div>
                          <div>
                              <Label htmlFor="name">Nome</Label>
                              <Input
                              id="name"
                              value={selectedUser.name}
                              onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                              required
                              />
                          </div>
                          <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                              id="email"
                              type="email"
                              value={selectedUser.email}
                              onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                              required
                              />
                          </div>
                          <div>
                              <Label htmlFor="role">Cargo</Label>
                              <Select 
                              value={selectedUser.role}
                              onValueChange={(role) => setSelectedUser({...selectedUser, role})}
                              >
                                  <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Escolha um cargo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectGroup>
                                      {userRoles.map((role, idx) => (
                                          <SelectItem key={idx} value={role}>{role}</SelectItem>
                                      ))}
                                      </SelectGroup>
                                  </SelectContent>
                              </Select>
                          </div>

                          <div>
                              <Label htmlFor="team">Time</Label>
                              <Select value={selectedUser.team.id.toString()}
                              onValueChange={(teamId) => {
                                  const selectedTeam = teams.find(team => team.id === Number(teamId));
                                  if (selectedTeam) {
                                    setSelectedUser({
                                      ...selectedUser,
                                      team: { id: selectedTeam.id, name: selectedTeam.name }
                                    });
                                  }
                                }}>
                                  <SelectTrigger className="w-[180px]">
                                      <SelectValue placeholder="Escolha um time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectGroup>
                                      {teams.map((team) => (
                                          <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
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
            ): (<NotFound name='usuário'/>)}
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

export default UsersTable;
