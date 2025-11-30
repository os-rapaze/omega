"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "~/components/ui/io/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/lib/api";
import { useOutletContext } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetFooter,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "~/components/ui/dialog";
import { X, ChevronsUpDown } from "lucide-react";

type ApiTarefa = {
  _id: string;
  name: string;
  description: string;
  projetoId: string;
  userIds: string[];
  typeId: string;
  status: string;
  hash: string;
  stepId?: string;
};

type ApiStep = {
  _id: string | null;
  name: string;
  color: string | null;
  order: number;
  tarefas: ApiTarefa[];
};

type KanbanColumn = {
  id: string;
  name: string;
  color?: string | null;
  order: number;
};

type Feature = {
  id: string;
  name: string;
  description: string;
  column: string;
  status: string;
  typeId: string;
  userIds: string[];
  owner?: {
    id: string;
    name: string;
    image?: string;
  } | null;
};

type ApiMember = {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email?: string;
};

type ApiTime = {
  _id: string;
  name: string;
  projetoId: string;
  members: ApiMember[];
};

type CreateTarefaSheetProps = {
  projetoId: string;
  columns: KanbanColumn[];
  onTarefaCreated: (feature: Feature) => void;
};

type TarefaTypeOption = {
  value: string; // id do tipo
  label: string; // texto pra exibir
};

const memberId = (m: ApiMember) => m.id ?? m._id;

const CreateTarefaSheet = ({
  projetoId,
  columns,
  onTarefaCreated,
}: CreateTarefaSheetProps) => {
  const [open, setOpen] = useState(false);

  const [times, setTimes] = useState<ApiTime[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  const [tarefaTypes, setTarefaTypes] = useState<TarefaTypeOption[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState<string>("");
  // usamos "backlog" como valor sentinela só no front, não mandamos isso pro backend
  const [stepId, setStepId] = useState<string>("backlog");

  // MULTI times e MULTI usuários
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [teamsPopoverOpen, setTeamsPopoverOpen] = useState(false);
  const [usersPopoverOpen, setUsersPopoverOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Estados do modal do Ômega
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // carrega times quando o sheet abrir
  useEffect(() => {
    if (!open || !projetoId) return;

    const fetchTimes = async () => {
      try {
        setLoadingTimes(true);
        const res = await api.get(`/projetos/${projetoId}/times`);
        setTimes(res.data ?? []);
      } catch (error) {
        console.error("Erro ao carregar times:", error);
      } finally {
        setLoadingTimes(false);
      }
    };

    const fetchTypes = async () => {
      try {
        setLoadingTypes(true);
        const res = await api.get(`/tarefas-tipos/projeto/${projetoId}`);
        const data = res.data;

        console.log("TIPOS DA API:", data);

        let normalized: TarefaTypeOption[] = [];

        if (Array.isArray(data)) {
          // Caso simples: API retorna ["bug", "feature", ...]
          if (data.length && typeof data[0] === "string") {
            normalized = data.map((value: string) => ({
              value, // aqui o próprio texto vira o id
              label: value,
            }));
          } else {
            // Caso: API retorna objetos
            normalized = data
              .map((item: any) => {
                const value =
                  item._id ?? // mais comum em Mongo
                  item.id ?? // fallback
                  item.value ??
                  ""; // último fallback (se API já mandar "value")

                const label =
                  item.nome ?? // se sua API usar "nome"
                  item.name ?? // ou "name"
                  item.label ?? // ou já mandar "label"
                  value; // fallback: mostra o próprio id

                return { value, label };
              })
              .filter((t) => !!t.value); // ignora itens sem id
          }
        }

        setTarefaTypes(normalized);
      } catch (error) {
        console.error("Erro ao carregar tipos de tarefa:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTimes();
    fetchTypes();
  }, [open, projetoId]);

  // quando abrir o modal do Ômega, já sugere a descrição atual
  useEffect(() => {
    if (aiOpen) {
      setAiExplanation("");
      setAiPrompt(description || "");
    }
  }, [aiOpen, description]);

  // usuários disponíveis = união dos members de todos os times selecionados
  const availableUsers: ApiMember[] = useMemo(() => {
    if (!selectedTeamIds.length) return [];
    const map = new Map<string, ApiMember>();

    times
      .filter((time) => selectedTeamIds.includes(time._id))
      .forEach((time) => {
        (time.members ?? []).forEach((m) => {
          map.set(memberId(m), m);
        });
      });

    return Array.from(map.values());
  }, [times, selectedTeamIds]);

  const selectedTeams = useMemo(
    () => times.filter((t) => selectedTeamIds.includes(t._id)),
    [times, selectedTeamIds],
  );

  const selectedUsers = useMemo(
    () => availableUsers.filter((u) => selectedUserIds.includes(memberId(u))),
    [availableUsers, selectedUserIds],
  );

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId];

      // recalcular quais usuários ainda são válidos com base nos times selecionados
      const allowedUserIds = new Set<string>();
      times
        .filter((t) => next.includes(t._id))
        .forEach((t) =>
          (t.members ?? []).forEach((m) => allowedUserIds.add(memberId(m))),
        );

      setSelectedUserIds((prevUsers) =>
        prevUsers.filter((uid) => allowedUserIds.has(uid)),
      );

      return next;
    });
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTypeId("");
    setStepId("backlog");
    setSelectedTeamIds([]);
    setSelectedUserIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !typeId) return;

    try {
      setSubmitting(true);

      const payload = {
        name,
        description,
        projetoId,
        userIds: selectedUserIds,
        typeId,
        stepId: stepId === "backlog" ? undefined : stepId,
      };

      const res = await api.post("/tarefas", payload);
      const tarefa: ApiTarefa = res.data;

      const columnId = tarefa.stepId ?? "backlog";

      const newFeature: Feature = {
        id: tarefa._id,
        name: tarefa.name,
        description: tarefa.description,
        column: columnId,
        status: tarefa.status,
        typeId: tarefa.typeId,
        userIds: tarefa.userIds ?? [],
        owner: undefined,
      };

      onTarefaCreated(newFeature);
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const stepOptions = columns; // inclui backlog se você quiser exibir também

  const handleOmegaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      setAiLoading(true);
      setAiExplanation("");

      const res = await api.post("/ask-omega/tarefa", {
        projetoId,
        description: aiPrompt,
      });

      const data = res.data ?? {};

      // Preenche campos automaticamente com o resultado do Ômega
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.typeId) setTypeId(data.typeId);
      if (data.stepId) setStepId(data.stepId);
      if (Array.isArray(data.userIds)) setSelectedUserIds(data.userIds);

      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation(
          "O Ômega sugeriu estes campos com base na descrição informada.",
        );
      }
    } catch (error) {
      console.error("Erro ao pedir ajuda do Ômega:", error);
      setAiExplanation(
        "Não foi possível gerar a tarefa automaticamente. Tente ajustar a descrição e tentar novamente.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Criar tarefa</Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Criar nova tarefa</SheetTitle>
          <SheetDescription>
            Preencha as informações da tarefa ou peça ajuda para o Ômega gerar
            automaticamente.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 mt-4 flex flex-col gap-4 overflow-y-auto"
        >
          {/* BOTÃO DO ÔMEGA */}

          {/* NOME */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Implementar tela de login"
            />
          </div>

          {/* DESCRIÇÃO */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              className="min-h-[80px]"
            />
          </div>

          {/* TIPO - Select shadcn dinâmico */}
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingTypes
                      ? "Carregando tipos..."
                      : tarefaTypes.length
                        ? "Selecione o tipo"
                        : "Nenhum tipo disponível"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tarefaTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STEP - Select shadcn, valor sentinela "backlog" */}
          <div className="flex flex-col gap-2">
            <Label>Step (coluna)</Label>
            <Select
              value={stepId}
              onValueChange={(value) => {
                setStepId(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o step" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">Backlog (sem step)</SelectItem>
                {stepOptions
                  .filter((step) => step.id !== "backlog")
                  .map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* TIMES - botão que abre dropdown + chips */}
          <div className="flex flex-col gap-2">
            <Label>Times</Label>

            <Popover open={teamsPopoverOpen} onOpenChange={setTeamsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-between"
                  disabled={loadingTimes}
                >
                  {selectedTeams.length
                    ? `Times selecionados: ${selectedTeams
                        .map((t) => t.name)
                        .join(", ")}`
                    : loadingTimes
                      ? "Carregando times..."
                      : "Selecionar times"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="p-0 w-[260px]"
                align="start"
                side="bottom"
              >
                <Command>
                  <CommandInput placeholder="Buscar time..." />
                  <CommandEmpty>Nenhum time encontrado.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {times.map((time) => {
                        const isSelected = selectedTeamIds.includes(time._id);
                        return (
                          <CommandItem
                            key={time._id}
                            onSelect={() => toggleTeam(time._id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="mr-2 h-4 w-4"
                            />
                            {time.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* chips de times selecionados */}
            {!!selectedTeams.length && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTeams.map((time) => (
                  <div
                    key={time._id}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-muted"
                  >
                    <span>{time.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleTeam(time._id)}
                      className="inline-flex items-center justify-center rounded-full hover:bg-destructive/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RESPONSÁVEIS - botão + dropdown + chips */}
          <div className="flex flex-col gap-2">
            <Label>Responsáveis</Label>

            <Popover open={usersPopoverOpen} onOpenChange={setUsersPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="justify-between"
                  disabled={!selectedTeamIds.length}
                >
                  {selectedUsers.length
                    ? `Responsáveis: ${selectedUsers
                        .map((u) => u.name)
                        .join(", ")}`
                    : !selectedTeamIds.length
                      ? "Selecione ao menos um time"
                      : "Selecionar responsáveis"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="p-0 w-[260px]"
                align="start"
                side="bottom"
              >
                <Command>
                  <CommandInput placeholder="Buscar usuário..." />
                  <CommandEmpty>
                    Nenhum usuário encontrado para os times.
                  </CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {availableUsers.map((user) => {
                        const id = memberId(user);
                        const isSelected = selectedUserIds.includes(id);
                        return (
                          <CommandItem key={id} onSelect={() => toggleUser(id)}>
                            <Checkbox
                              checked={isSelected}
                              className="mr-2 h-4 w-4"
                            />
                            <span>
                              {user.name}
                              {user.username ? ` (${user.username})` : ""}
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* chips de responsáveis selecionados */}
            {!!selectedUsers.length && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((user) => {
                  const id = memberId(user);
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-muted"
                    >
                      <span>
                        {user.name}
                        {user.username ? ` (${user.username})` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleUser(id)}
                        className="inline-flex items-center justify-center rounded-full hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {!selectedTeamIds.length && (
              <p className="text-xs text-muted-foreground">
                Para escolher responsáveis, selecione primeiro um ou mais times.
              </p>
            )}
          </div>

          <SheetFooter className="mt-auto">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">
                Criar com inteligência artificial
              </Label>

              <Dialog open={aiOpen} onOpenChange={setAiOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    Pedir ajuda do Ômega
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Pedir ajuda do Ômega</DialogTitle>
                    <DialogDescription>
                      Explique a tarefa que você quer criar. O Ômega vai sugerir
                      nome, descrição, tipo, step e responsáveis com base na sua
                      descrição.
                    </DialogDescription>
                  </DialogHeader>

                  {aiExplanation && (
                    <div className="text-xs text-muted-foreground border border-muted rounded-md p-2 bg-muted/40">
                      {aiExplanation}
                    </div>
                  )}

                  <form
                    onSubmit={handleOmegaSubmit}
                    className="mt-4 flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="omega-description">
                        Descreva a tarefa
                      </Label>

                      {/* Caixa de texto com bordas reluzentes */}
                      <div className="relative rounded-lg p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse">
                        <Textarea
                          id="omega-description"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="min-h-[120px] bg-background rounded-md resize-vertical"
                          placeholder="Ex.: Criar tela de cadastro de usuário com validação de campos, integração com API de criação de contas e mensagens de erro amigáveis..."
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Quanto mais contexto você der, melhor o Ômega consegue
                        sugerir campos coerentes.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setAiOpen(false)}
                      >
                        Fechar
                      </Button>
                      <Button type="submit" disabled={aiLoading}>
                        {aiLoading ? "Ômega pensando..." : "Gerar com Ômega"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Button type="submit" disabled={submitting || !name || !typeId}>
              {submitting ? "Criando..." : "Criar tarefa"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// ========================
// Kanban principal
// ========================
const Example = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarefaTypes, setTarefaTypes] = useState<TarefaTypeOption[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  const prevColumnsRef = useRef<Record<string, string>>({});

  const statusConfig: Record<
    Feature["status"],
    { label: string; className: string }
  > = {
    TODO: {
      label: "A fazer",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800",
    },
    IN_PROGRESS: {
      label: "Em progresso",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200/70 dark:border-blue-800",
    },
    REVIEW: {
      label: "Em revisão",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-200/70 dark:border-amber-800",
    },
    BLOCKED: {
      label: "Bloqueada",
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200 border border-red-200/70 dark:border-red-800",
    },
    FINISHED: {
      label: "Concluída",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-200/70 dark:border-emerald-800",
    },
  };
  const statusOptions = Object.entries(statusConfig).map(([value, cfg]) => ({
    value: value as Feature["status"],
    label: cfg.label,
  }));

  function getStatusConfig(status: Feature["status"]) {
    return statusConfig[status] ?? statusConfig.TODO;
  }

  useEffect(() => {
    prevColumnsRef.current = Object.fromEntries(
      features.map((f) => [f.id, f.column]),
    );
  }, [features]);

  const handleStatusChange = (
    featureId: string,
    newStatus: Feature["status"],
  ) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === featureId ? { ...f, status: newStatus } : f)),
    );

    api.patch(`/tarefas/${featureId}`, { status: newStatus }).catch((err) => {
      console.error("Erro ao atualizar status da tarefa:", err);
      // se quiser, pode fazer rollback aqui
    });
  };

  const handleTypeChange = (featureId: string, newTypeId: string) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId
          ? {
              ...f,
              // guarda só o id ou mantém o objeto, você escolhe;
              // aqui vou guardar só o id e usar o label do array de tipos
              typeId: newTypeId as any,
            }
          : f,
      ),
    );

    api.patch(`/tarefas/${featureId}`, { typeId: newTypeId }).catch((err) => {
      console.error("Erro ao atualizar tipo da tarefa:", err);
      // idem rollback se quiser
    });
  };

  const handleKanbanDataChange = (nextFeatures: Feature[]) => {
    const prevColumns = prevColumnsRef.current;

    nextFeatures.forEach((feature) => {
      const prevColumn = prevColumns[feature.id];

      // só dispara request se a coluna mudou
      if (prevColumn && prevColumn !== feature.column) {
        const newStepId =
          feature.column === "backlog" ? "backlog" : feature.column;

        console.log("Mudou de coluna", {
          id: feature.id,
          prevColumn,
          newColumn: feature.column,
        });

        api
          .patch(`/tarefas/${feature.id}`, {
            stepId: newStepId,
          })
          .catch((err) => {
            console.error("Erro ao atualizar coluna da tarefa:", err);
          });
      }
    });

    // atualiza o estado local
    setFeatures(nextFeatures);
  };

  // 👉 aqui eu só adicionei o name no tipo
  const { projeto } = useOutletContext<{
    projeto: { _id: string; name?: string };
  }>();

  useEffect(() => {
    if (!projeto?._id) return;

    const fetchTypes = async () => {
      try {
        setLoadingTypes(true);
        const res = await api.get(`/tarefas-tipos/projeto/${projeto._id}`);
        const data = res.data;

        let normalized: TarefaTypeOption[] = [];

        if (Array.isArray(data)) {
          if (data.length && typeof data[0] === "string") {
            normalized = data.map((value: string) => ({
              value,
              label: value,
            }));
          } else {
            normalized = data
              .map((item: any) => {
                const value = item._id ?? item.id ?? item.value ?? "";

                const label = item.nome ?? item.name ?? item.label ?? value;

                return { value, label };
              })
              .filter((t) => !!t.value);
          }
        }

        setTarefaTypes(normalized);
      } catch (error) {
        console.error("Erro ao carregar tipos de tarefa:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchTypes();
  }, [projeto._id]);

  const getFeatureTypeId = (feature: Feature): string => {
    const t: any = feature.typeId;
    if (!t) return "";
    if (typeof t === "string") return t;
    return t._id ?? t.id ?? t.value ?? "";
  };

  const getFeatureTypeLabel = (feature: Feature, types: TarefaTypeOption[]) => {
    const t: any = feature.typeId;

    if (typeof t === "string") {
      return types.find((opt) => opt.value === t)?.label ?? t;
    }

    return t?.name ?? t?.nome ?? t?.label ?? "";
  };

  useEffect(() => {
    if (!projeto?._id) return;

    const fetchKanban = async () => {
      try {
        const res = await api.get(`/tarefas/projeto/${projeto._id}/kanban`);
        const steps: ApiStep[] = res.data.steps ?? res.data;

        const mappedColumns: KanbanColumn[] = steps
          .map((step) => ({
            id: step._id ?? "backlog",
            name: step.name ?? "Backlog",
            color: step.color ?? "#6B7280",
            order: step.order,
          }))
          .sort((a, b) => a.order - b.order);

        const mappedFeatures: Feature[] = steps.flatMap((step) => {
          const columnId = step._id ?? "backlog";

          return (step.tarefas ?? []).map((tarefa) => ({
            id: tarefa._id,
            name: tarefa.name,
            description: tarefa.description,
            column: columnId,
            status: tarefa.status,
            // se o backend manda typeId já certinho, use tarefa.typeId
            typeId: (tarefa as any).typeId ?? (tarefa as any).type,
            userIds: tarefa.userIds ?? [],
            owner: undefined,
          }));
        });

        setColumns(mappedColumns);
        setFeatures(mappedFeatures);
      } catch (error) {
        console.error("Erro ao carregar kanban:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKanban();
  }, [projeto._id]);

  // ========= NOVAS INFOS DO HEADER =========
  const totalTasks = features.length;

  // ajuste esse array de status se no backend você usar outro texto
  const doneStatuses = [
    "done",
    "concluida",
    "concluída",
    "finalizada",
    "concluido",
    "finished",
  ];

  const completedTasks = features.filter(
    (f) => f.status && doneStatuses.includes(f.status.toLowerCase()),
  ).length;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  if (loading) {
    return <div>Carregando kanban...</div>;
  }

  if (!columns.length) {
    return <div>Nenhuma coluna encontrada.</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* HEADER MAIS RICO */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold truncate">
            Visualizando tarefas de:{" "}
            <span className="text-primary font-bold">
              {projeto?.name ?? "Projeto sem nome"}
            </span>
          </h1>

          <p className="text-xs md:text-sm text-muted-foreground">
            {columns.length} etapa{columns.length !== 1 && "s"} · {totalTasks}{" "}
            tarefa{totalTasks !== 1 && "s"} · {completedTasks} concluída
            {completedTasks !== 1 && "s"} ({completionPercentage}%)
          </p>

          {/* barra de progresso */}
          <div className="mt-1 h-1.5 w-100 md:w-100 rounded-full bg-muted overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-primary transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CreateTarefaSheet
            projetoId={projeto._id}
            columns={columns}
            onTarefaCreated={(feature) =>
              setFeatures((prev) => [...prev, feature])
            }
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-x-auto">
        <KanbanProvider
          columns={columns}
          data={features}
          onDataChange={handleKanbanDataChange}
        >
          {(column: KanbanColumn) => (
            <KanbanBoard
              id={column.id}
              key={column.id}
              className="min-w-[400px]"
            >
              <KanbanHeader>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color ?? "#6B7280" }}
                  />
                  <span>{column.name}</span>
                </div>
              </KanbanHeader>

              <KanbanCards id={column.id}>
                {(feature: Feature) => {
                  const status = getStatusConfig(feature.status);
                  const currentTypeId = getFeatureTypeId(feature);
                  const currentTypeLabel = getFeatureTypeLabel(
                    feature,
                    tarefaTypes,
                  );

                  return (
                    <KanbanCard
                      column={column.id}
                      id={feature.id}
                      key={feature.id}
                      name={feature.name}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Título + dono */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col gap-1">
                            <p className="m-0 font-semibold text-sm md:text-[15px] leading-snug">
                              {feature.name}
                            </p>
                            {feature.description && (
                              <p className="m-0 text-xs md:text-[13px] text-muted-foreground line-clamp-2">
                                {feature.description}
                              </p>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 rounded-md hover:bg-accent">
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem>
                                Mostrar detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>Editar tarefa</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                Excluir tarefa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {feature.owner && (
                            <div className="flex flex-col items-end gap-1">
                              <Avatar className="h-6 w-6 shrink-0 border border-border/60">
                                <AvatarImage src={feature.owner.image} />
                                <AvatarFallback className="text-[10px] font-medium">
                                  {feature.owner.name
                                    ?.slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="max-w-[90px] truncate text-[10px] text-muted-foreground">
                                {feature.owner.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tipo + status (com dropdown) */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs">
                          {/* Tipo */}
                          <Select
                            value={currentTypeId || undefined}
                            onValueChange={(value) =>
                              handleTypeChange(feature.id, value)
                            }
                            disabled={loadingTypes || !tarefaTypes.length}
                          >
                            <SelectTrigger className="px-2 !h-7 rounded-lg border bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200 text-[10px] md:text-[11px] font-medium w-auto">
                              <SelectValue
                                placeholder={
                                  loadingTypes
                                    ? "Carregando tipos..."
                                    : "Tipo não definido"
                                }
                              >
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-300" />
                                  {currentTypeLabel || "Definir tipo"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {tarefaTypes.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Status */}
                          <Select
                            value={feature.status}
                            onValueChange={(value) =>
                              handleStatusChange(
                                feature.id,
                                value as Feature["status"],
                              )
                            }
                          >
                            <SelectTrigger
                              className={
                                "px-2 rounded-lg !h-7 border text-[10px] md:text-[11px] font-medium w-auto " +
                                status.className
                              }
                            >
                              <SelectValue>
                                <span className="inline-flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-current/80" />
                                  {status.label}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </KanbanCard>
                  );
                }}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>
    </div>
  );
};

export default Example;
