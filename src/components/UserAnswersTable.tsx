import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { LoaderCircle } from "lucide-react";
import ApiService from '@/services/ApiService';
import { Answer, DefaultAnswer, Form, Question } from '@/types/User';
import { useNavigate, useParams } from 'react-router-dom';
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from './ui/label';
import { CardActions } from '@mui/material';
import { Textarea } from "@/components/ui/textarea"
import { Separator } from './ui/separator';

const UserAnswersTable = () => {
    const navigate = useNavigate();
    const { formId, answerId } = useParams(); 
    const apiService = new ApiService();
    const apiEndpoint = "private/answers"
    const [questions, setQuestions] = useState<Question[]>([]);
    const [form, setForm] = useState<Form>();
    const [answer, setAnswer] = useState<Answer>(DefaultAnswer);

    const [answers, setAnswers] = useState<{ [questionId: number]: string | string[] }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        async function fetchForm() {
          try {
            const [formsResponse, answerResponse] = await Promise.all([
              apiService.get(`${apiEndpoint}/formToAnswer/${formId}`),
              apiService.get(`${apiEndpoint}/${answerId}`),
              new Promise(resolve => setTimeout(resolve, 1500))
            ]);
    
            setForm(formsResponse.data);

            if (answerResponse.data.userHasAnswered) {
                navigate("/dashboard")
            }
            setAnswer(answerResponse.data);
            setQuestions(formsResponse.data.questions || []);
          } catch (error) {
            console.error("Error fetching form data", error);
          } finally {
            setIsInitialLoading(false);
          }
        }
    
        fetchForm();
      }, [formId]);


    const handleAnswerChange = (questionId: number, value: string | string[]) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const formIsValid = () => {
        return questions.every(question => {
            const answer = answers[question.id];
            if (Array.isArray(answer)) {
                return answer.length > 0;
            }
            return answer !== undefined && answer !== '';
        });
    };

    const renderQuestionInput = (question: Question) => {
        switch (question.type) {
            case "Texto Longo":
                return (
                    <Textarea
                        placeholder="Digite sua resposta"
                        value={answers[question.id] as string || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
                                            handleAnswerChange(question.id, [...selectedOptions, option]);
                                        } else {
                                            handleAnswerChange(question.id, selectedOptions.filter((o) => o !== option));
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
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
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

        const jsonString = JSON.stringify(answers)
        
        try {
          const [response] = await Promise.all([
            apiService.put(`${apiEndpoint}/${answerId}`, {userAnswers: jsonString, userHasAnswered: true}),
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
        <div className='flex justify-center'>
            <Card className='lg:min-h-[100vh] lg:min-w-[80vh] flex flex-col'>
                {isInitialLoading ? (
                    <div className="flex-1 flex justify-center items-center h-64">
                        <LoaderCircle className="animate-spin h-8 w-8" />
                    </div>
                ) : (
                    <>
                    <CardHeader className='text-start'>  
                        {form && answer && <CardTitle className='text-3xl'>{form.name} - {form.category} - {answer.userToEvaluate? answer.userToEvaluate.name : answer.user.name}</CardTitle> }
                    </CardHeader>
                    <CardDescription>
                        <div className='max-w-[80vh] px-6 mb-2 text-1xl'>
                        <p>{form && form.description}</p>
                        </div>
                    </CardDescription>

                    <div className='px-6 py-3'>
                        <Separator className=''/>
                    </div>

                    <CardContent className="flex-1 flex flex-col">
                        <div>
                            {questions.map((question, idx) => (
                                <div key={question.id} className="mt-7">
                                    <label className="block font-semibold mb-2 text-1xl">{idx+1}) {question.title}</label>
                                    {renderQuestionInput(question)}
                                </div>
                            ))}
                        </div>

                        <div className='flex-1 flex py-6'>
                            <Separator className=''/>
                        </div>

                        <CardActions className='flex-1 flex !p-0 mt-3'>
                            <Button type="submit" onClick={handleUpdateAnswer} disabled={isLoading || !formIsValid()}>
                                {isLoading ? (
                                    <>
                                    <LoaderCircle className="animate-spin mr-2" />
                                    Aguarde
                                    </>
                                ) : (
                                    'Responder'
                                )}
                            </Button>
                        </CardActions>  
                    </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
};

export default UserAnswersTable;
