import React, { useEffect, useRef, useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Eye, LoaderCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { 
  Filter, 
  Download, 
} from "lucide-react"
import ApiService from '@/services/ApiService'
import { Answer, DefaultAnswer } from '@/types/User'
import { useSearchParams  } from 'react-router-dom'
import NotFound from './NotFound'
import Pagination from './Pagination'
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Checkbox } from './ui/checkbox'
import FormAnswered from './ViewAnswers'
import { DialogActions } from '@mui/material'
import { DatePickerWithRange } from './ui/datepicker'
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent } from './ui/dialog'

const MyTeamTable = () => {
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const take = parseInt(import.meta.env.VITE_TABLE_TAKE);
    const isAdmin = localStorage.getItem(import.meta.env.VITE_AUTH_COOKIE_NAME) === "Admin";

    const [answers, setAnswers] = useState<Answer[]>([]);
     const [searchTerm, setSearchTerm] = useState('');
    const [selectedAnswer, setSelectedAnswer] = useState<Answer>(DefaultAnswer);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [filterPage, setFilterPage] = useState(page)
    const [totalAnswersPage, setTotalAnswersPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false);
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;
    

    useEffect(() => {
        const fetchAnswers = async () => {
          setIsInitialLoading(true);
            try {
              const [answersResponse] = await Promise.all([
                apiService.get(`${apiEndpoint}/myTeam`, {"take": take, "page": page}),
                new Promise(resolve => setTimeout(resolve, 1500))
              ]);

              setAnswers(Array.isArray(answersResponse.data.answers) ? answersResponse.data.answers : []);
              setTotalAnswersPage(answersResponse.data.total? Math.ceil(answersResponse.data.total / take) : 1);
            } catch (error) {
                console.error('Error fetching answers:', error);
                setAnswers([]);
            } finally {
              setIsInitialLoading(false);
            }
        };

        fetchAnswers();
    }, []);
    
    const handleAnswerSelect = (answer: Answer) => {
        setSelectedAnswer({ ...answer});
    };

    const filteredAnswers = answers.length > 0 ? answers.filter(answer =>
    [answer.id.toString(), answer.user.name, answer.user.team.name, answer.form.category, answer.userAnswers?.toString()].some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    ): [];

    const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [addIsOpen, setAddIsOpen] = useState(false);

    const formatDate = (dataTimestamp: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dataTimestamp));
    }

    useEffect(() => {
      if (addIsOpen) {
        setSelectedAnswers([]);
      }
    }, [selectedAnswers])

    const handleCheckboxChange = (answer: Answer) => {
      setSelectedAnswers(prev => {
        if (prev.includes(answer)) {
          const newSelection = prev.filter(a => a !== answer)

          return newSelection
        } else if (prev.length < 2) {
          return [...prev, answer]
        }
        return prev
      })
    }

    const tabelaRef = useRef<HTMLTableElement>(null);
    const downloadPDF = async () => {
      setIsInitialLoading(true);
      if (tabelaRef.current) {
        try {
          const canvas = await html2canvas(tabelaRef.current, {
            useCORS: true,
            scale: 2,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: "#fff",
          });
    
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
    
          const imgWidth = pdfWidth; // Ajusta para caber no PDF
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
          let position = 0; // Altura inicial da página
    
          // Divide o conteúdo em várias páginas
          while (position < imgHeight) {
            pdf.addImage(
              imgData,
              "PNG",
              0,
              -position, // Move para a parte correta do canvas
              imgWidth,
              imgHeight
            );
    
            position += pdfHeight; // Incrementa para a próxima página
    
            if (position < imgHeight) {
              pdf.addPage();
            }
          }
          pdf.save(`${uuidv4()}.pdf`);
          setIsLoading(false);
        } catch (error) {
          console.error("An error occurred. Please try again.");
        }
      }
    };

    const showFormAnswers = (answer: Answer) => {
      setIsModalOpen(true);
      setSelectedAnswers([answer]);
    }

    const isCheckboxDisabled = (answer: Answer) => {
      return (!answer.userHasAnswered) || (selectedAnswers.length >= 2 && !selectedAnswers.includes(answer))
    }

    return (
    <Card className='min-h-[70vh] flex flex-col'>
      <CardHeader>
        <CardTitle className='text-2xl'>Respostas dos Formulários do Time</CardTitle>
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
              placeholder="Procure por ID, Nome, Formulário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2"
            />
          </div>
          <div className="flex gap-2">
            <DatePickerWithRange from={from} to={to}/>
          </div>
        </div>
        {filteredAnswers.length > 0 ? (
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            {isAdmin &&<TableHead>ID</TableHead>}
            <TableHead>Nome</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Formulário</TableHead>
            <TableHead>Respondido em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAnswers.map((answer, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">
              <Checkbox
                checked={selectedAnswers.includes(answer)}
                onCheckedChange={() => handleCheckboxChange(answer)}
                disabled={isCheckboxDisabled(answer)}
              />
            </TableCell>
              {isAdmin &&<TableCell>{answer.id}</TableCell>}
              <TableCell className="font-medium">{answer.user.name}</TableCell>
              <TableCell className="font-medium">{answer.form.team.name}</TableCell>
              <TableCell className="font-medium">{answer.form.name} - {answer.form.category}</TableCell>
              <TableCell className="font-medium">{(answer.userHasAnswered)? answer.updatedAt && formatDate(answer.updatedAt): "-"}</TableCell>
              <TableCell className="font-medium">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${answer.userHasAnswered? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {answer.userHasAnswered? "Respondido" : "Não Respondido"}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <Button disabled={!answer.userHasAnswered} variant="ghost" className='p-1 opacity-70' onClick={() => showFormAnswers(answer)}>
                  <Eye /> 
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className={selectedAnswers.length == 2 ? "max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[100vh] overflow-y-auto justify-between" : ""}>
            <div className={selectedAnswers.length == 2 ? 'gap-3 md:block lg:flex' : ''} ref={tabelaRef}>
              {selectedAnswers.map((answer) => (
                <FormAnswered answer={answer} />
              ))}
            </div>

            <DialogActions>

              <Button variant="outline" onClick={() => {setIsModalOpen(false)}}>
                Fechar
              </Button>

              {isLoading? (
                <Button type="submit" disabled><LoaderCircle className="animate-spin" />Aguarde</Button>)
                :
              <Button onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              }

            </DialogActions>
          </DialogContent>
        </Dialog>

      </Table>
        ): (<NotFound name='Nenhuma resposta de formulário encontrada.'/>)}
          <Pagination name="meuTime" filterPage={filterPage} totalUsersPage={totalAnswersPage} />
          </>
      )}
      </CardContent>
    </Card>
  )
}

export default MyTeamTable;
