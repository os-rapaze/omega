import React, { useState, useEffect, useMemo } from "react";
import { Users, ClipboardList } from "lucide-react";
import { Input } from "~/components/ui/input";
import { TeamCard } from "~/components/team-card";
import { api } from "~/lib/api";
import { useOutletContext } from "react-router";

type ApiMember = {
  _id: string;
  name: string;
  username?: string;
  email?: string;
};

type ApiTeam = {
  _id: string;
  name: string;
  projetoId: string;
  members: ApiMember[];
  __v?: number;
};

type TeamMember = {
  id: string;
  name: string;
  username?: string;
  email?: string;
};

type Team = {
  id: string;
  name: string;
  members: TeamMember[];
};

type ApiTarefa = {
  _id: string;
  name: string;
  description?: string;
  projetoId: string;
  userIds: string[];
  status?: string;
  hash: string;
};

type UserTaskLink = {
  _id: string;
  name: string;
  hash: string;
};

type ProjetoOutletContext = {
  projeto: { _id: string; name?: string };
};

export const TeamsDashboard: React.FC = () => {
  const { projeto } = useOutletContext<ProjetoOutletContext>();

  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<ApiTarefa[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const handleTeamToggle = (teamId: string) => {
    setExpandedTeams(
      (prev) =>
        prev.includes(teamId)
          ? prev.filter((id) => id !== teamId) // se já estava aberto, fecha
          : [...prev, teamId], // se não estava, abre sem fechar os outros
    );
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [teamsRes, tasksRes] = await Promise.all([
          api.get<ApiTeam[]>(`/projetos/${projeto._id}/times`),
          api.get<ApiTarefa[]>(`/projetos/${projeto._id}/tarefas`),
        ]);

        const apiTeams = teamsRes.data ?? [];
        const apiTasks = tasksRes.data ?? [];

        const normalizedTeams: Team[] = apiTeams.map((team) => ({
          id: team._id,
          name: team.name,
          members: (team.members ?? []).map((member) => ({
            id: member._id,
            name: member.name,
            username: member.username,
            email: member.email,
          })),
        }));

        const normalizedTasks: ApiTarefa[] = apiTasks.map((t) => ({
          _id: t._id,
          name: t.name,
          description: t.description,
          projetoId: t.projetoId,
          userIds: Array.isArray(t.userIds) ? t.userIds : [],
          status: t.status,
          hash: t.hash,
        }));

        setTeams(normalizedTeams);
        setTasks(normalizedTasks);
      } catch (err) {
        console.error("Erro ao carregar times/tarefas:", err);
      } finally {
        setLoading(false);
      }
    }

    if (projeto?._id) {
      loadData();
    }
  }, [projeto._id]);

  // métricas por time com base nos usuários nas tarefas
  const teamMetrics = useMemo(() => {
    const metrics: Record<
      string,
      { totalTasks: number; uniqueContributors: number }
    > = {};
    const teamMemberIdsMap: Record<string, Set<string>> = {};
    const teamContributors: Record<string, Set<string>> = {};

    teams.forEach((team) => {
      metrics[team.id] = { totalTasks: 0, uniqueContributors: 0 };
      teamMemberIdsMap[team.id] = new Set(team.members.map((m) => m.id));
      teamContributors[team.id] = new Set();
    });

    tasks.forEach((task) => {
      const taskUserIds = new Set(task.userIds ?? []);

      teams.forEach((team) => {
        const memberIds = teamMemberIdsMap[team.id];
        if (!memberIds.size || !taskUserIds.size) return;

        const hasIntersection = [...memberIds].some((id) =>
          taskUserIds.has(id),
        );

        if (hasIntersection) {
          metrics[team.id].totalTasks += 1;
          task.userIds.forEach((uid) => {
            if (memberIds.has(uid)) {
              teamContributors[team.id].add(uid);
            }
          });
        }
      });
    });

    Object.keys(teamContributors).forEach((teamId) => {
      metrics[teamId].uniqueContributors = teamContributors[teamId].size;
    });

    return metrics;
  }, [teams, tasks]);

  // tarefas por usuário (pra mostrar no card)
  const tasksByUser = useMemo(() => {
    const map = new Map<string, UserTaskLink[]>();

    tasks.forEach((t) => {
      (t.userIds ?? []).forEach((uid) => {
        const list = map.get(uid) ?? [];
        list.push({ _id: t._id, name: t.name, hash: t.hash });
        map.set(uid, list);
      });
    });

    return map;
  }, [tasks]);

  // métricas globais
  const totalTeams = teams.length;
  const totalTasks = tasks.length;
  const totalMembers = useMemo(
    () => new Set(teams.flatMap((t) => t.members.map((m) => m.id))).size,
    [teams],
  );

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center pt-10 text-muted-foreground">
        Carregando times...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-2 space-y-6">
          {/* HEADER + MÉTRICAS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold text-foreground">
                  Times do projeto
                </h1>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Visualize as equipes, seus membros e como o esforço em tarefas
                  está distribuído entre os times deste projeto.
                </p>
              </div>

              <div className="relative flex-1 max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar equipe pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Times</span>
                  <span className="text-sm font-semibold text-foreground">
                    {totalTeams} equipe
                    {totalTeams === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Membros únicos</span>
                  <span className="text-sm font-semibold text-foreground">
                    {totalMembers} pessoa
                    {totalMembers === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10">
                  <ClipboardList className="h-4 w-4 text-sky-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    Tarefas do projeto
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {totalTasks} tarefa
                    {totalTasks === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LISTA DE TIMES */}
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isExpanded={expandedTeams.includes(team.id)}
                onToggle={() => handleTeamToggle(team.id)}
                metrics={teamMetrics[team.id]}
                tasksByUser={tasksByUser}
              />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">Nenhuma equipe encontrada</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
