import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
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
import SideBarLayout from './SideBar'
import UsersTable from './UsersTable'

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideBarLayout />

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Relatório Geral</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-blue-600">Usuários</h3>
              <p className="text-2xl font-bold">999</p>
              <p className="text-sm text-gray-500">Últimos 7 dias</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-600">Ativos</h3>
              <p className="text-2xl font-bold">888</p>
              <p className="text-sm text-gray-500">Usuários ativos</p>
            </div>
            <div>
              <h3 className="font-semibold text-red-600">Inativos</h3>
              <p className="text-2xl font-bold">111</p>
              <p className="text-sm text-gray-500">Usuários inativos</p>
            </div>
          </CardContent>
        </Card>
        
      </main>
    </div>
  )
}

export default DashboardLayout