import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Mail,
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";

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

type UserTaskLink = {
  _id: string;
  name: string;
  hash: string;
};

interface TeamCardProps {
  team: Team;
  isExpanded: boolean;
  onToggle: () => void;
  metrics?: {
    totalTasks: number;
    uniqueContributors: number;
  };
  // agora opcional
  tasksByUser?: Map<string, UserTaskLink[]>;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isExpanded,
  onToggle,
  metrics,
  tasksByUser,
}) => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle: string }>();

  const totalMembers = team.members.length;
  const totalTasks = metrics?.totalTasks ?? 0;
  const uniqueContributors = metrics?.uniqueContributors ?? 0;

  // fallback seguro caso não seja passado
  const tasksByUserSafe: Map<string, UserTaskLink[]> =
    tasksByUser ?? new Map<string, UserTaskLink[]>();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const selectedMember = useMemo(
    () => team.members.find((m) => m.id === selectedMemberId) ?? null,
    [selectedMemberId, team.members],
  );

  const selectedMemberTasks: UserTaskLink[] = useMemo(() => {
    if (!selectedMemberId) return [];
    return tasksByUserSafe.get(selectedMemberId) ?? [];
  }, [selectedMemberId, tasksByUserSafe]);

  const initials = (nameOrUsername: string) => {
    const trimmed = nameOrUsername.trim();
    if (!trimmed) return "US";
    const parts = trimmed.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (
      (parts[0][0] ?? "").toUpperCase() + (parts[1][0] ?? "").toUpperCase()
    );
  };

  const openMemberTasks = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  const closeMemberTasks = () => {
    setSelectedMemberId(null);
  };

  const goToTask = (taskId: string) => {
    if (!handle) return;
    navigate(`/app/${handle}/tasks/${taskId}`);
  };

  return (
    <>
      <div className="bg-input/30 border border-border rounded-lg overflow-hidden transition-all duration-300">
        {/* HEADER DO TIME */}
        <div
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={onToggle}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-3 h-3 rounded-full bg-primary/70" />

            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-foreground font-medium truncate">
                {team.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users size={14} />
                  <span>
                    {totalMembers} membro
                    {totalMembers === 1 ? "" : "s"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <ClipboardList size={14} />
                  <span>
                    {totalTasks} tarefa
                    {totalTasks === 1 ? "" : "s"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <Users size={14} className="opacity-70" />
                  <span>
                    {uniqueContributors} colaborador
                    {uniqueContributors === 1 ? "" : "es"} em tarefas
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (!handle) return;
                navigate(`/app/${handle}/tasks`);
              }}
            >
              Acessar tarefas
            </Button>
            {isExpanded ? (
              <ChevronUp className="text-muted-foreground" size={20} />
            ) : (
              <ChevronDown className="text-muted-foreground" size={20} />
            )}
          </div>
        </div>

        {/* DESCRIÇÃO DO CARD */}
        <div className="px-4 pb-2 text-[11px] text-muted-foreground">
          Este card mostra o tamanho da equipe, quantas tarefas estão ligadas
          aos seus membros e quem, de fato, está contribuindo nas tarefas.
        </div>

        {/* ÁREA EXPANDIDA COM MEMBROS */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4">
            <div className="bg-input/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground font-medium mb-3 pb-2 border-b border-border">
                <span>Nome</span>
                <span>E-mail</span>
              </div>

              {team.members.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum membro cadastrado para este time.
                </p>
              ) : (
                <div className="space-y-3">
                  {team.members.map((member) => {
                    const displayName =
                      member.name ||
                      (member.username ? `@${member.username}` : "");
                    const displayUsername =
                      member.name && member.username
                        ? `@${member.username}`
                        : "";

                    const userTasks = tasksByUserSafe.get(member.id) ?? [];
                    const isOnTasks = userTasks.length > 0;

                    return (
                      <div
                        key={member.id}
                        className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_auto] gap-4 items-center py-2 rounded-lg px-2 transition-colors"
                      >
                        {/* COLUNA: NOME / USERNAME */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">
                            {initials(displayName || member.username || "US")}
                            {isOnTasks && (
                              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border border-background flex items-center justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-background" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground text-sm font-medium truncate">
                              {displayName || "Usuário sem nome"}
                            </p>
                            {displayUsername && (
                              <p className="text-muted-foreground text-xs truncate">
                                {displayUsername}
                              </p>
                            )}
                            {isOnTasks && (
                              <p className="text-[11px] text-emerald-500 mt-0.5">
                                Ativo em {userTasks.length} tarefa
                                {userTasks.length === 1 ? "" : "s"}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* COLUNA: EMAIL */}
                        <div className="flex items-center space-x-2 text-sm min-w-0">
                          <Mail
                            size={14}
                            className="text-muted-foreground shrink-0"
                          />
                          <span className="truncate text-muted-foreground">
                            {member.email || "Sem endereço eletrônico"}
                          </span>
                        </div>

                        {/* COLUNA: BOTÃO VER TAREFAS */}
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openMemberTasks(member.id)}
                          >
                            <ListChecks className="h-3 w-3" />
                            Ver tarefas
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAREFAS DO MEMBRO */}
      <Dialog open={!!selectedMemberId} onOpenChange={closeMemberTasks}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="h-4 w-4 text-primary" />
              {selectedMember ? (
                <span>
                  Tarefas de{" "}
                  <span className="font-semibold">{selectedMember.name}</span>
                </span>
              ) : (
                "Tarefas do usuário"
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="text-[11px] text-muted-foreground mb-2">
            Lista de tarefas em que este usuário está atribuído. Clique em uma
            tarefa para abrir os detalhes.
          </div>

          <div className="flex-1">
            <ScrollArea className="h-full pr-2">
              {selectedMemberTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma tarefa atribuída a este usuário.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {selectedMemberTasks.map((t) => (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => goToTask(t._id)}
                      className="w-full text-left border border-border rounded-md px-3 py-2 hover:bg-accent/10 cursor-pointer transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="flex flex-col gap-2 min-w-0 flex-1">
                        <div className="flex justify-between w-full">
                          <span className="font-medium text-foreground truncate">
                            {t.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Acessar tarefa
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Badge
                            className="border-accent/20 bg-accent/20"
                            variant="outline"
                          >
                            {t.hash}
                          </Badge>
                          <span className="truncate">
                            Tarefa vinculada ao projeto
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
