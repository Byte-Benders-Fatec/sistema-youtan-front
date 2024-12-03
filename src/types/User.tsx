interface Team {
    id: number;
    name: string;
}

const DefaultTeam: Team = {
    id: 0,
    name: ''
}

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    team: Team;
}

const DefaultUser: User = {
    id: 0,
    name: '',
    email: '',
    password: '',
    role: '',
    team: {id: 0, name: ""}
  };

interface Form {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    category: string;
    questions?: Question[];
    description: string;
    team: Team;
}

const DefaultForm: Form = {
    id: 0,
    name: "",
    createdAt: new Date(),
    category: "",
    description: "",
    team: {id: 0, name: ""}
}

interface Question {
    id: number;
    category: string;
    title: string;
    alternatives: string[];
    type: string;
    form: Form | number;
}

const DefaultQuestion: Question = {
    id: 0,
    category: "",
    title: '',
    alternatives: [""],
    type: "",
    form: {
        id: 0,
        name: "",
        description: "",
        createdAt: new Date(),
        category: "",
        team: {id: 0, name: ""}
    }
}

interface Answer {
    id: number;
    userAnswers: string;
    user: User;
    form: Form;
    userHasAnswered: boolean;
    userToEvaluate: User | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

const DefaultAnswer: Answer = {
    id: 0,
    userAnswers: "",
    user: {
        id: 0,
        name: '',
        email: '',
        password: '',
        role: '',
        team: {id: 0, name: ""}
      },
    form: {
        id: 0,
        name: "",
        createdAt: new Date(),
        category: "",
        description: "",
        team: {id: 0, name: ""}
    },
    userHasAnswered: false,
    userToEvaluate: {
        id: 0,
        name: '',
        email: '',
        password: '',
        role: '',
        team: {id: 0, name: ""}
      }
}

export {DefaultUser, DefaultTeam, DefaultForm, DefaultQuestion, DefaultAnswer};
export type { User, Team, Form, Question, Answer };