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

export type { User, Team };