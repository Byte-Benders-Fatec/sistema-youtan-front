import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LoaderCircle } from "lucide-react";
import ApiService from '@/services/ApiService';
import { Form, Question } from '@/types/User';
import { useParams } from 'react-router-dom';
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from './ui/label';

const UserAnswersTable = () => {
    const { formId, answerId } = useParams(); 
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [questions, setQuestions] = useState<any[]>([]);
    const [answer, setAnswer] = useState<Form>();

    const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        async function fetchForm() {
          try {
            const [formsResponse] = await Promise.all([
              apiService.get(`${apiEndpoint}/formToAnswer/${formId}`),
              new Promise(resolve => setTimeout(resolve, 1500))
            ]);
    
            setAnswer(formsResponse.data);
            setQuestions(formsResponse.data.questions || []);
          } catch (error) {
            console.error("Error fetching form data", error);
          } finally {
            setIsInitialLoading(false);
          }
        }
    
        fetchForm();
      }, [formId]);

    const handleAnswerChange = (questionId: string, value: string | string[]) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const renderQuestionInput = (question: Question) => {
        switch (question.type) {
            case "Texto Longo":
                return (
                    <Input
                        placeholder="Digite sua resposta"
                        value={answers[question.id] as string || ""}
                        onChange={(e) => handleAnswerChange(question.id.toString(), e.target.value)}
                    />
                );
            case "Múltipla Escolha":
                return (
                    <div>
                        {question.alternatives.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    checked={(answers[question.id] as string[] || []).includes(option)}
                                    onCheckedChange={(checked) => {
                                        const selectedOptions = answers[question.id] as string[] || [];
                                        if (checked) {
                                            handleAnswerChange(question.id.toString(), [...selectedOptions, option]);
                                        } else {
                                            handleAnswerChange(question.id.toString(), selectedOptions.filter((o) => o !== option));
                                        }
                                    }}
                                />
                                <label>{option}</label>
                            </div>
                        ))}
                    </div>
                );
            case "Escolha Única":
                return (
                    <RadioGroup
                        value={answers[question.id] as string || ""}
                        onValueChange={(value) => handleAnswerChange(question.id.toString(), value)}
                    >
                        {question.alternatives.map((option, index) => (
                            <div key={option} className="flex items-center space-x-2">
                                <RadioGroupItem value={option} id={`radio-${question.id}-${index}`} />
                                <Label htmlFor={`radio-${question.id}-${index}`}>{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );
            default:
                return null;
        }
    };

    const handleUpdateAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formAnswers = Object.entries(answers).map(([key, value]) => {
            const question = questions.find((question) => question.id === parseInt(key));
            return question ? `- ${question.title} -> ${value}` : '';
          });          
        try {
          const [response] = await Promise.all([
            apiService.put(`${apiEndpoint}/${answerId}`, {userAnswers: formAnswers, userHasAnswered: true}),
            new Promise(resolve => setTimeout(resolve, 1500))
          ]);
    
          if (response.data.error) {
            throw new Error(response.data.error)
          }
          
          window.location.href = "/dashboard"
        } catch (error: any) {
            console.error("Erro ao adicionar formulário! Tente novamente...");
        } finally {
          setIsLoading(false);
    
        }
      }

    return (
        <Card className='min-h-[70vh] flex flex-col'>
            <CardHeader className='text-start'>  
                {answer && <CardTitle className='text-4xl'>{answer.name} - {answer.category}</CardTitle> }
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {isInitialLoading ? (
                    <div className="flex-1 flex justify-center items-center h-64">
                        <LoaderCircle className="animate-spin h-8 w-8" />
                    </div>
                ) : (
                    <div>
                        {questions.map((question) => (
                            <div key={question.id} className="mb-4">
                                <label className="block font-semibold mb-2">{question.title}</label>
                                {renderQuestionInput(question)}
                            </div>
                        ))}
                        <Button type="submit" onClick={handleUpdateAnswer} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                <LoaderCircle className="animate-spin mr-2" />
                                Aguarde
                                </>
                            ) : (
                                'Enviar'
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserAnswersTable;
