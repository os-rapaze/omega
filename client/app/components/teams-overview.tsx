import React, { useState } from "react";
import {
  Search,
  Filter,
  Home,
  Folder,
  Users,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { TeamCard } from "~/components/team-card";
import { Input } from "~/components/ui/input";
import { mockTeams } from "~/data/mockData";

export const TeamsDashboard: React.FC = () => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTeamToggle = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const filteredTeams = mockTeams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                key={team.id}
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
