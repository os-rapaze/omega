export interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline";
  progress: number;
  email?: string;
  phone?: string;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  progress: number;
  memberCount: number;
  members: Member[];
}

export const mockTeams: Team[] = [
  {
    id: "backend",
    name: "Backend Projeto Ômega",
    category: "Backend",
    progress: 75,
    memberCount: 3,
    members: [
      {
        id: "joao",
        name: "João Vítor Machado de Souza",
        role: "Backend Developer",
        status: "online",
        progress: 85,
        email: "joao.ms2007@aluno.ifsc.edu.br",
        phone: "+55 (48) 99601-5417",
      },
      {
        id: "maria",
        name: "Maria Silva Santos",
        role: "DevOps Engineer",
        status: "online",
        progress: 70,
        email: "maria.santos@aluno.ifsc.edu.br",
        phone: "+55 (48) 99123-4567",
      },
      {
        id: "carlos",
        name: "Carlos Eduardo Lima",
        role: "Database Administrator",
        status: "offline",
        progress: 65,
        email: "carlos.lima@aluno.ifsc.edu.br",
        phone: "+55 (48) 99876-5432",
      },
    ],
  },
  {
    id: "frontend",
    name: "Frontend Projeto Ômega",
    category: "Frontend",
    progress: 60,
    memberCount: 4,
    members: [
      {
        id: "ana",
        name: "Ana Paula Oliveira",
        role: "Frontend Developer",
        status: "online",
        progress: 80,
        email: "ana.oliveira@aluno.ifsc.edu.br",
        phone: "+55 (48) 99234-5678",
      },
      {
        id: "pedro",
        name: "Pedro Henrique Costa",
        role: "UI/UX Designer",
        status: "online",
        progress: 55,
        email: "pedro.costa@aluno.ifsc.edu.br",
        phone: "+55 (48) 99345-6789",
      },
      {
        id: "julia",
        name: "Júlia Fernandes",
        role: "Frontend Developer",
        status: "offline",
        progress: 45,
        email: "julia.fernandes@aluno.ifsc.edu.br",
        phone: "+55 (48) 99456-7890",
      },
      {
        id: "lucas",
        name: "Lucas Rodrigues",
        role: "QA Tester",
        avatar:
          "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
        status: "online",
        progress: 70,
        email: "lucas.rodrigues@aluno.ifsc.edu.br",
        phone: "+55 (48) 99567-8901",
      },
    ],
  },
];
