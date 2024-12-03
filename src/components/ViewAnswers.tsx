import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Answer, Form, Question } from '@/types/User';
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from './ui/label';
import { Separator } from './ui/separator';

const FormAnswered = (props: {answer: Answer}) => {
    const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] }>({});

    useEffect(() => {
        setAnswers(JSON.parse(props.answer.userAnswers))
    })

    const renderQuestionInput = (question: Question) => {
        switch (question.type) {
            case "Texto Longo":
                return (
                    <p>
                        R: {answers[question.id] as string || ""}
                    </p>
                );
            case "Múltipla Escolha":
                return (
                    <div>
                        {question.alternatives.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                                <Checkbox
                                    disabled
                                    checked={(answers[question.id] as string[] || []).includes(option)}
                                />
                                <label>{option}</label>
                            </div>
                        ))}
                    </div>
                );
            case "Escolha Única":
                return (
                    <RadioGroup
                        disabled
                        value={answers[question.id] as string || ""}
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

    return (
        <Card className='flex flex-col lg:min-w-[50%] lg:max-w-[100%] sm:max-w-[100%]'>
            <CardHeader className='text-start'>
                {props.answer && (
                    <CardTitle className='text-lg font-semibold'>
                        Formulário: <span className='font-thin'>{props.answer.form.name}</span> <br />
                        Categoria: <span className='font-thin'>{props.answer.form.category}</span> <br />
                        Usuário: <span className='font-thin'>{props.answer.userToEvaluate ? props.answer.userToEvaluate.name : props.answer.user.name}</span>
                    </CardTitle>
                )}
            </CardHeader>

            <Separator/>

            <CardContent className="flex-1 flex flex-col">
                <div>
                    {props.answer.form.questions && props.answer.form.questions.map((question, idx) => (
                        <div key={question.id} className="mt-7">
                            <label className="block font-semibold mb-2 text-1xl">{idx+1}) {question.title}</label>
                            {renderQuestionInput(question)}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default FormAnswered;
