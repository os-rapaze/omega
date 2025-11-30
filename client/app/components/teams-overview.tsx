import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Input } from "~/components/ui/input";
import { TeamCard } from "~/components/team-card";
import { api } from "~/lib/api";
import { useOutletContext } from "react-router";

type ApiTeam = {
  _id: string;
  name: string;
  projetoId: string;
  members: string[]; // IDs dos membros
  __v?: number;
};

type TeamMember = {
  id: string;
  name: string;
  role?: string;
};

type Team = {
  id: string;
  name: string;
  members: TeamMember[];
};

export const TeamsDashboard: React.FC = () => {
  const { projeto } = useOutletContext<{ projeto: { _id: string } }>();

  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const handleTeamToggle = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await api.get<ApiTeam[]>(`/projetos/${projeto._id}/times`);

        const apiTeams = res.data ?? [];

        const normalizedTeams: Team[] = apiTeams.map((team) => ({
          id: team._id, // agora existe `id` pra usar de key
          name: team.name,
          members: (team.members ?? []).map((member) => ({
            id: member._id,
            name: member.name,
            username: member.username,
            email: member.email,
          })),
        }));

        setTeams(normalizedTeams);
      } catch (err) {
        console.error("Erro ao carregar times:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTeams();
  }, [projeto._id]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center pt-10 text-gray-400">
        Carregando times...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input/30"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id} // ✅ agora é único
                team={team}
                isExpanded={expandedTeam === team.id}
                onToggle={() => handleTeamToggle(team.id)}
              />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">Nenhuma equipe encontrada</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
