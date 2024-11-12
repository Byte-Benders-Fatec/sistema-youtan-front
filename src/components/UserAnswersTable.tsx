import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from 'react-router-dom';

import ApiService from "@/services/ApiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Form } from "@/types/User";

const UserAnswersForm = () => {
  const { formId, answerId } = useParams(); 
  const apiService = new ApiService();
  const apiEndpoint = "private/answers"
  const [questions, setQuestions] = useState<any[]>([]);
  const [answer, setAnswer] = useState<Form>();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<Record<string, string>>({});

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

  const { register, setValue,getValues, formState: { errors } } = useForm();

  const handleCheckboxChange = (questionId: string, value: string) => {
    setMultiSelectAnswers((prev) => {
      const selectedValues = prev[questionId]
        ? prev[questionId].split(",").filter((v) => v)
        : [];
      const updatedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      
      const concatenatedValues = updatedValues.join(", ");
      setValue(questionId, concatenatedValues);
      return { ...prev, [questionId]: concatenatedValues };
    });
  };

  const handleUpdateAnswer = async (e: React.FormEvent) => {
 
    e.preventDefault();
    setIsLoading(true);

    try {
      const formAnswers = Object.values(getValues());
      const [response] = await Promise.all([
        apiService.put(`${apiEndpoint}/${answerId}`, {userAnswers: formAnswers.join(", "), userHasAnswered: true}),
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
      <CardHeader>
        {answer && <CardTitle className='text-4xl'>{answer.name} - {answer.category}</CardTitle>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isInitialLoading ? (
          <div className="flex-1 flex justify-center items-center h-64">
            <LoaderCircle className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <form onSubmit={handleUpdateAnswer} className="space-y-8">
            {questions.map((question) => (
              <div key={question.id} className="flex flex-col space-y-2">
                <label htmlFor={question.id} className="font-semibold">{question.title}</label>

                {question.type === "Texto Longo" ? (
                  <Input
                    id={String(question.id)}  
                    {...register(String(question.id), { required: "Campo obrigatório", minLength: { value: 3, message: "A resposta deve ter no mínimo 3 caracteres" } })}
                    placeholder="Resposta"
                    className="p-2 border border-gray-300 rounded"
                  />
                ) : (
                  <div className="flex flex-col space-y-1">
                    {question.alternatives?.map((alternative: string) => (
                      <div key={alternative} className="flex items-center space-x-2">
                        <input
                          type={question.type === "Múltipla Escolha" ? "checkbox" : "radio"}
                          id={`${String(question.id)}-${alternative}`}
                          value={alternative}
                          {...(question.type === "Múltipla Escolha"
                            ? {}
                            : register(String(question.id), { required: "Seleção obrigatória" })
                          )}
                          onChange={() =>
                            question.type === "Múltipla Escolha" &&
                            handleCheckboxChange(String(question.id), alternative)
                          }
                          className="cursor-pointer"
                        />
                        <label htmlFor={`${String(question.id)}-${alternative}`} className="cursor-pointer">
                          {alternative}
                        </label>
                      </div>
                    ))}
                    {question.type === "Múltipla Escolha" && (
                      <input
                        type="hidden"
                        {...register(String(question.id), { required: "Seleção obrigatória" })}
                        value={multiSelectAnswers[question.id] || ""}
                      />
                    )}
                  </div>
                )}
                
                {errors[question.id] && (
                  <p className="text-red-600 text-sm">{errors[question.id]?.message as string}</p>
                )}
              </div>
            ))}
            <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoaderCircle className="animate-spin mr-2" />
                      Aguarde
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default UserAnswersForm;
