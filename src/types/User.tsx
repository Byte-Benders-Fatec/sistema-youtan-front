interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    team: Team;
}

interface Team {
    id: number;
    name: string;
}

interface Form {
    id: number;
    category: string;
    questions: Question[];
}

interface Question {
    id: number;
    title: string;
    alternatives: string[];
    type: string;
    form: Form;
}

interface Answer {
    id: number;
    userAnswers: string[];
    user: User;
    form: Form;
}

export type { User, Team, Form, Question, Answer };