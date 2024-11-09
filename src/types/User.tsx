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
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
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
    userHasAnswered: boolean;
}

export type { User, Team, Form, Question, Answer };