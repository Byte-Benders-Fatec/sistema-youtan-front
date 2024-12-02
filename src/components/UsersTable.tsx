import React, { useEffect, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { LoaderCircle, Plus, UserPen, UserRoundX } from "lucide-react"
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
import { Filter, Download } from "lucide-react"
import ApiService from '@/services/ApiService'
import { User, DefaultUser, Team } from '@/types/User'
import { DialogDescription } from '@radix-ui/react-dialog'
import NotFound from './NotFound'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSearchParams  } from 'react-router-dom'
import Pagination from './Pagination'

export default function UsersTable() {
  const apiService = new ApiService()
  const apiEndpoint = "private/users"
  const apiTeamEndpoint = "private/teams"
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const take = parseInt(import.meta.env.VITE_TABLE_TAKE);

  const [users, setUsers] = useState<User[]>([])
  const [userRoles, setUsersRoles] = useState<string[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newUser, setNewUser] = useState<User>(DefaultUser)
  const [selectedUser, setSelectedUser] = useState<User>(DefaultUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [userAddError, setUserAddError] = useState("")
  const [addIsOpen, setAddIsOpen] = useState(false)
  const [updateIsOpen, setUpdateIsOpen] = useState(false)
  const [filterPage, setFilterPage] = useState(page)
  const [totalUsersPage, setTotalUsersPage] = useState(1)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsInitialLoading(true)
      try {
        const [usersResponse, rolesResponse, teamsResponse] = await Promise.all([
          apiService.get(`${apiEndpoint}`, {"take": take, "page": page}),
          apiService.get(`${apiEndpoint}/roles`),
          apiService.get(apiTeamEndpoint),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        setUsers(Array.isArray(usersResponse.data.users) ? usersResponse.data.users : [])
        setTotalUsersPage(usersResponse.data.total? Math.ceil(usersResponse.data.total / take) : 1)
        setUsersRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : [])
        setTeams(Array.isArray(teamsResponse.data.teams) ? teamsResponse.data.teams : [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setUsers([])
        setUsersRoles([])
        setTeams([])
      } finally {
        setIsInitialLoading(false)
      }
    }

    fetchUsers()
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser({ ...user })
  }

  const filteredUsers = users.length > 0
  ? users.filter(user =>
      [user.id.toString(), user.name, user.email, user.role, user.team?.name]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  : []

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setUserAddError("")

    try {
      const [response] = await Promise.all([
        apiService.post(apiEndpoint, newUser),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      if (response.data.error) {
        throw new Error(response.data.error)
      }
      setUsers(prevUsers => Array.isArray(prevUsers) ? [...prevUsers, response.data] : [response.data])
      setAddIsOpen(false);
      setNewUser(DefaultUser)
    } catch (error: any) {
      setUserAddError(error.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const [response] = await Promise.all([
        apiService.put(`${apiEndpoint}/${selectedUser.id}`, selectedUser),
        new Promise(resolve => setTimeout(resolve, 1500))
      ])

      if (response.data.error) {
        throw new Error(response.data.error)
      }
      setUsers(prevUsers => 
        Array.isArray(prevUsers) 
          ? prevUsers.map(user => user.id === selectedUser.id ? response.data : user)
          : [response.data]
      )
      setUpdateIsOpen(false)
    } catch (error: any) {
      console.error("Error updating user:", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const [response] = await Promise.all([
        apiService.delete(`${apiEndpoint}/${selectedUser.id}`),
        new Promise(resolve => setTimeout(resolve, 1500))
      ])

      if (response.data.error) {
        throw new Error(response.data.error)
      }
      setUsers(prevUsers => 
        Array.isArray(prevUsers) 
          ? prevUsers.filter(user => user.id !== selectedUser.id)
          : []
      )
    } catch (error: any) {
      console.error("Error removing user:", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const rolesColors: { [key in any]: string } = {
    "Admin": "bg-red-100 text-red-800",
    "Líder": "bg-blue-100 text-blue-800",
    "Liderado": "bg-green-100 text-green-800",
    "Líder e Liderado": "bg-orange-100 text-orange-800",
  }

  return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Usuários</CardTitle>
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
                        <Label htmlFor="password">Senha</Label>
                        <Input
                        type='password'
                          id="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="role">Cargo</Label>
                        <Select
                          onValueChange={(role) => setNewUser({...newUser, role})}
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
                            const newTeam = teams.find(team => team.id === Number(teamId))
                            if (newTeam) {
                              setNewUser({
                                ...newUser,
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
                          <Button type="button" variant="secondary" disabled={isLoading}>
                            Cancelar
                          </Button>
                        </DialogClose>
                        <Button 
                          type="submit" 
                          disabled={isLoading || !newUser.name || !newUser.email || !newUser.role || !newUser.team.name}
                        >
                          {isLoading ? (
                            <>
                              <LoaderCircle className="animate-spin mr-2" />
                              Aguarde
                            </>
                          ) : (
                            'Adicionar'
                          )}
                        </Button>
                      </div>
                      {userAddError && <p className="text-red-500 text-sm">{userAddError}</p>}
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
            {users.length > 0 ? (
              filteredUsers.length > 0 ? (
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.team.name}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rolesColors[user.role]}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            <Button 
                              variant="ghost" 
                              className='p-1 opacity-70' 
                              onClick={() => {
                                handleUserSelect(user)
                                setUpdateIsOpen(true)
                              }}
                            >
                              <UserPen />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  className='p-1 opacity-70' 
                                  onClick={() => handleUserSelect(user)}
                                >
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
                                      <Button type="button" variant="secondary" disabled={isLoading}>
                                        Cancelar
                                      </Button>
                                    </DialogClose>
                                    <Button type="submit" className='bg-red-800' disabled={isLoading}>
                                      {isLoading ? (
                                        <>
                                          <LoaderCircle className="animate-spin mr-2" />
                                          Aguarde
                                        </>
                                      ) : (
                                        'Excluir'
                                      )}
                                    </Button>
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
              ) : (
                <p className="text-center py-4">Nenhum usuário encontrado com os critérios de busca.</p>
              )
            ) : (
              <NotFound name='Nenhum usuário encontrado.'/>
            )}
            <Pagination name="usuarios" filterPage={filterPage} totalUsersPage={totalUsersPage} />
          </>
        )}
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
                <Select 
                  value={selectedUser.team.id.toString()}
                  onValueChange={(teamId) => {
                    const selectedTeam = teams.find(team => team.id === Number(teamId))
                    if (selectedTeam) {
                      setSelectedUser({
                        ...selectedUser,
                        team: { id: selectedTeam.id, name: selectedTeam.name }
                      })
                    }
                  }}
                >
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
                  <Button type="button" variant="secondary" disabled={isLoading}>
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" />
                      Aguarde
                    </>
                  ) : (
                    'Atualizar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
