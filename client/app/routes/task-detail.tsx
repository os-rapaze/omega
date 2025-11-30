"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import { api } from "~/lib/api";
import {
  ArrowLeft,
  Clock,
  User,
  FileCode,
  Hash as HashIcon,
  Columns,
  Type,
  History as HistoryIcon,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

type ApiUser = {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
};

type ApiTarefaDetail = {
  _id: string;
  name: string;
  description?: string;
  hash: string;
  projetoId: { _id: string; name: string } | string;
  userIds: (ApiUser | string)[];
  typeId?: { _id: string; name: string } | string | null;
  stepId?: { _id: string; name: string } | string | null;
  status: string;
  deadlineHours?: number | null; // prazo em horas
  createdAt?: string;
  updatedAt?: string;
};

type ApiTarefaHistory = {
  _id: string;
  filePath: string;
  elapsedTime: string; // em minutos (string vinda da API)
  tarefaId: string;
  userId?: string;
  createdAt: string;
};

type ProjetoOutletContext = {
  projeto: { _id: string; name?: string };
};

const statusConfig: Record<
  string,
  { label: string; colorClass: string; dotClass: string }
> = {
  TODO: {
    label: "A fazer",
    colorClass:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
    dotClass: "bg-slate-500",
  },
  IN_PROGRESS: {
    label: "Em progresso",
    colorClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200",
    dotClass: "bg-blue-500",
  },
  REVIEW: {
    label: "Em revisão",
    colorClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
    dotClass: "bg-amber-500",
  },
  BLOCKED: {
    label: "Bloqueada",
    colorClass: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200",
    dotClass: "bg-red-500",
  },
  FINISHED: {
    label: "Concluída",
    colorClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
    dotClass: "bg-emerald-500",
  },
};

function formatHours(hours: number) {
  if (hours <= 0) return "0 h";

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  if (hours < 10) {
    return `${hours.toFixed(1)} h`;
  }
  return `${hours.toFixed(0)} h`;
}

const TaskDetailPage = () => {
  const { tarefaId } = useParams<{ tarefaId: string }>();
  const navigate = useNavigate();
  const { projeto } = useOutletContext<ProjetoOutletContext>();

  const [tarefa, setTarefa] = useState<ApiTarefaDetail | null>(null);
  const [history, setHistory] = useState<ApiTarefaHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyFilterUserId, setHistoryFilterUserId] = useState<
    "all" | string
  >("all");

  useEffect(() => {
    if (!tarefaId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [tarefaRes, historyRes] = await Promise.all([
          api.get(`/tarefas/${tarefaId}`),
          api.get(`/tarefas/${tarefaId}/history`),
        ]);

        setTarefa(tarefaRes.data);
        setHistory(historyRes.data ?? []);
      } catch (err) {
        console.error("Erro ao carregar detalhes da tarefa:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tarefaId]);

  // ==========================
  //   DERIVADOS / MÉTRICAS
  // ==========================

  const totalMinutes = useMemo(
    () =>
      history.reduce(
        (acc, item) => acc + (parseFloat(item.elapsedTime || "0") || 0),
        0,
      ),
    [history],
  );

  const totalHours = totalMinutes / 60;

  const distinctFilesCount = useMemo(
    () => new Set(history.map((h) => h.filePath)).size,
    [history],
  );

  const totalEdits = history.length;

  // agrupado por usuário (armazenando minutos)
  const historyByUser = useMemo(() => {
    const map = new Map<
      string,
      { userId: string; totalMinutes: number; entries: ApiTarefaHistory[] }
    >();

    history.forEach((h) => {
      const key = h.userId ?? "unknown";
      const minutes = parseFloat(h.elapsedTime || "0") || 0;
      const entry = map.get(key) ?? {
        userId: key,
        totalMinutes: 0,
        entries: [],
      };
      entry.totalMinutes += minutes;
      entry.entries.push(h);
      map.set(key, entry);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalMinutes - a.totalMinutes,
    );
  }, [history]);

  const participantsCount = useMemo(
    () => historyByUser.filter((u) => u.userId !== "unknown").length,
    [historyByUser],
  );

  const deadlineHours = tarefa?.deadlineHours ?? null;
  const remainingHours =
    deadlineHours != null ? Math.max(deadlineHours - totalHours, 0) : null;
  const progress =
    deadlineHours && deadlineHours > 0
      ? Math.min((totalHours / deadlineHours) * 100, 100)
      : null;

  const isOverBudget =
    deadlineHours != null && deadlineHours > 0 && totalHours > deadlineHours;

  const statusCfg =
    (tarefa && statusConfig[tarefa.status]) || statusConfig.TODO;

  const typeLabel =
    typeof tarefa?.typeId === "string"
      ? tarefa?.typeId
      : ((tarefa?.typeId as any)?.name ?? "");
  const stepLabel =
    typeof tarefa?.stepId === "string"
      ? tarefa?.stepId
      : ((tarefa?.stepId as any)?.name ?? "Backlog");

  const users =
    tarefa?.userIds?.map((u) =>
      typeof u === "string" ? { _id: u, name: u } : (u as ApiUser),
    ) ?? [];

  const hasUnknownUser = useMemo(
    () => history.some((h) => !h.userId),
    [history],
  );

  // últimas 20 alterações
  const lastHistoryEntries = useMemo(
    () =>
      history
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    [history],
  );

  const filteredHistory = useMemo(() => {
    let list = history
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (historyFilterUserId !== "all") {
      list = list.filter(
        (h) => (h.userId ?? "unknown") === historyFilterUserId,
      );
    }

    return list;
  }, [history, historyFilterUserId]);

  // insights globais de arquivos
  const fileInsights = useMemo(() => {
    const perFile = new Map<string, { count: number; totalMinutes: number }>();

    history.forEach((h) => {
      const minutes = parseFloat(h.elapsedTime || "0") || 0;
      const current = perFile.get(h.filePath) ?? { count: 0, totalMinutes: 0 };
      current.count += 1;
      current.totalMinutes += minutes;
      perFile.set(h.filePath, current);
    });

    let mostEdited: { filePath: string; count: number } | null = null;
    let mostTime: { filePath: string; totalMinutes: number } | null = null;

    perFile.forEach((value, filePath) => {
      if (!mostEdited || value.count > mostEdited.count) {
        mostEdited = { filePath, count: value.count };
      }
      if (!mostTime || value.totalMinutes > mostTime.totalMinutes) {
        mostTime = { filePath, totalMinutes: value.totalMinutes };
      }
    });

    return { mostEdited, mostTime };
  }, [history]);

  if (loading || !tarefa) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Carregando detalhes da tarefa...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-semibold truncate">
                  {tarefa.name}
                </h1>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-primary/5 border-primary/20 text-primary"
                >
                  <HashIcon className="h-3 w-3" />
                  {tarefa.hash}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Projeto:{" "}
                <span className="font-medium text-foreground">
                  {projeto?.name ?? "Projeto sem nome"}
                </span>
              </p>
            </div>
          </div>

          <Badge
            className={
              "flex items-center gap-2 px-3 py-1 text-[11px] border shadow-sm " +
              statusCfg.colorClass
            }
          >
            <span className={"h-2 w-2 rounded-full " + statusCfg.dotClass} />
            {statusCfg.label}
          </Badge>
        </div>

        {/* GRID SUPERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {/* COLUNA ESQUERDA: visão geral mais rica */}
          <div className="space-y-4 lg:col-span-2">
            <Card className="h-full border-primary/15 bg-gradient-to-br from-card via-card to-primary/10">
              <CardHeader className="pb-3 border-primary/15">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Columns className="h-4 w-4 text-primary" />
                  <span>Visão geral da tarefa</span>
                </CardTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Resumo textual da tarefa, contexto e principais métricas de
                  esforço e colaboração.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bloco de texto de contexto maior */}
                <div className="space-y-2 text-sm">
                  {tarefa.description && (
                    <p className="text-muted-foreground leading-relaxed">
                      {tarefa.description}
                    </p>
                  )}

                  <p className="text-xs md:text-sm text-muted-foreground">
                    Esta tarefa está atualmente na coluna{" "}
                    <span className="font-semibold text-foreground">
                      {stepLabel}
                    </span>{" "}
                    com status{" "}
                    <span className="font-semibold text-foreground">
                      {statusCfg.label}
                    </span>
                    . Até agora, foram registradas{" "}
                    <span className="font-semibold">{totalEdits}</span>{" "}
                    alteração
                    {totalEdits === 1 ? "" : "es"} em{" "}
                    <span className="font-semibold">{distinctFilesCount}</span>{" "}
                    arquivo
                    {distinctFilesCount === 1 ? "" : "s"}, somando{" "}
                    <span className="font-semibold">
                      {formatHours(totalHours)}
                    </span>{" "}
                    de esforço total distribuído entre{" "}
                    <span className="font-semibold">
                      {participantsCount || 0}
                    </span>{" "}
                    colaborador
                    {participantsCount === 1 ? "" : "es"}.{" "}
                    {deadlineHours != null && deadlineHours > 0 && (
                      <>
                        O prazo estimado para esta tarefa é de{" "}
                        <span className="font-semibold">
                          {formatHours(deadlineHours)}
                        </span>{" "}
                        e o esforço registrado{" "}
                        {isOverBudget ? (
                          <span className="font-semibold text-red-600 inline-flex items-center gap-1">
                            já ultrapassou esse limite
                            <AlertTriangle className="h-3 w-3" />.
                          </span>
                        ) : (
                          "ainda está dentro desse limite."
                        )}
                      </>
                    )}
                  </p>
                </div>

                <Separator />

                {/* Chips principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Type className="h-3 w-3" />
                      Tipo
                    </span>
                    <Badge className="w-fit bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-100 border-violet-300/60">
                      {typeLabel || "Não definido"}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Columns className="h-3 w-3" />
                      Coluna
                    </span>
                    <Badge className="w-fit bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-100 border-sky-300/60">
                      {stepLabel}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <HistoryIcon className="h-3 w-3" />
                      Atividade
                    </span>
                    <span className="font-medium">
                      {totalEdits} alteração
                      {totalEdits === 1 ? "" : "es"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {distinctFilesCount} arquivo
                      {distinctFilesCount === 1 ? "" : "s"} envolvidos
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      Colaboradores
                    </span>
                    <span className="font-medium">
                      {participantsCount || 0} participante
                      {participantsCount === 1 ? "" : "s"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {users.length} responsável
                      {users.length === 1 ? "" : "is"} atribuído
                    </span>
                  </div>
                </div>

                {/* Lista de responsáveis com texto mais descritivo */}
                <Separator />
                <div className="space-y-1 text-xs">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    Responsáveis pela tarefa
                  </span>
                  {users.length ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {users.map((u) => (
                        <div
                          key={u._id}
                          className="inline-flex items-center gap-2 rounded-full bg-background/80 border border-border/60 px-3 py-1"
                        >
                          <span className="text-[11px] font-medium">
                            {u.name}
                            {u.username ? ` (${u.username})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Nenhum responsável atribuído ainda. Considere atribuir um
                      ou mais usuários para aumentar a visibilidade do dono da
                      tarefa.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA DIREITA: tempo & insights */}
          <div className="space-y-4">
            {/* Tempo & prazo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Tempo & prazo
                </CardTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Mostra o tempo total registrado, o prazo estimado e quanto
                  resta (ou já foi extrapolado) em horas.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">
                      Tempo total registrado
                    </span>
                    <span
                      className={
                        "font-semibold text-sm inline-flex items-center gap-1 " +
                        (isOverBudget ? "text-red-600" : "")
                      }
                    >
                      {isOverBudget && <AlertTriangle className="h-3 w-3" />}
                      {formatHours(totalHours)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Prazo (horas)</span>
                    <span className="font-semibold text-sm">
                      {deadlineHours != null
                        ? formatHours(deadlineHours)
                        : "Não definido"}
                    </span>
                  </div>

                  {deadlineHours != null && (
                    <div className="flex flex-col gap-1 col-span-2">
                      <span className="text-muted-foreground">
                        Horas restantes
                      </span>
                      <span className="font-semibold text-sm">
                        {formatHours(remainingHours ?? 0)}
                      </span>
                    </div>
                  )}
                </div>

                {progress != null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        Uso do orçamento de horas
                      </span>
                      <span className="font-medium">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {remainingHours != null && remainingHours <= 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-red-600 mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        Prazo de horas estourado.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights de arquivos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Insights de arquivos
                </CardTitle>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Destaques dos arquivos que mais concentram alterações e tempo
                  investido nesta tarefa.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {history.length === 0 ? (
                  <p className="text-muted-foreground">
                    Ainda não há dados suficientes para gerar insights.
                  </p>
                ) : (
                  <>
                    {fileInsights.mostEdited && (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                          Arquivo mais editado
                        </span>
                        <span className="font-medium truncate">
                          {fileInsights.mostEdited.filePath}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {fileInsights.mostEdited.count} alteração
                          {fileInsights.mostEdited.count > 1 ? "es" : ""}
                        </span>
                      </div>
                    )}

                    {fileInsights.mostTime && (
                      <div className="flex flex-col gap-1 pt-1 border-t mt-2">
                        <span className="text-muted-foreground">
                          Arquivo com maior tempo total
                        </span>
                        <span className="font-medium truncate">
                          {fileInsights.mostTime.filePath}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatHours(fileInsights.mostTime.totalMinutes / 60)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* GRID INFERIOR: ESFORÇO POR USUÁRIO + histórico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Esforço por usuário */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Esforço por usuário
                </span>
              </CardTitle>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Distribui o esforço entre os colaboradores, mostrando em quais
                arquivos cada pessoa concentrou mais tempo.
              </p>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ScrollArea className="h-full pr-2">
                {historyByUser.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum registro de tempo ainda.
                  </p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {historyByUser.map((u) => {
                      const userInfo = users.find((x) => x._id === u.userId);
                      const label =
                        u.userId === "unknown"
                          ? "Usuário não informado"
                          : userInfo
                            ? `${userInfo.name}${
                                userInfo.username
                                  ? ` (${userInfo.username})`
                                  : ""
                              }`
                            : u.userId;

                      const percentage =
                        totalMinutes > 0
                          ? Math.round((u.totalMinutes / totalMinutes) * 100)
                          : 0;

                      const perFile = new Map<string, number>();
                      u.entries.forEach((entry) => {
                        const minutes =
                          parseFloat(entry.elapsedTime || "0") || 0;
                        perFile.set(
                          entry.filePath,
                          (perFile.get(entry.filePath) || 0) + minutes,
                        );
                      });

                      let topFilePath: string | null = null;
                      let topFileMinutes = 0;
                      perFile.forEach((mins, filePath) => {
                        if (mins > topFileMinutes) {
                          topFileMinutes = mins;
                          topFilePath = filePath;
                        }
                      });

                      const editedFilesCount = perFile.size;
                      const userHours = u.totalMinutes / 60;
                      const topFileHours = topFileMinutes / 60;
                      const topFileShare =
                        u.totalMinutes > 0
                          ? Math.round((topFileMinutes / u.totalMinutes) * 100)
                          : 0;

                      return (
                        <div
                          key={u.userId}
                          className="border rounded-lg p-3 space-y-2 bg-background/80"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold truncate">
                                {label}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {editedFilesCount} arquivo
                                {editedFilesCount === 1 ? "" : "s"} editado
                                {editedFilesCount === 1 ? "" : "s"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[11px] text-muted-foreground">
                                Esforço total
                              </span>
                              <span className="text-xs font-semibold">
                                {formatHours(userHours)}
                              </span>
                            </div>
                          </div>

                          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-1 rounded-full bg-primary/80"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Participação no esforço da tarefa</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>

                          {topFilePath && (
                            <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-2">
                              <span className="text-[11px] text-muted-foreground">
                                Arquivo com maior esforço
                              </span>
                              <p className="text-xs font-semibold truncate">
                                {topFilePath}
                              </p>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span>
                                  Tempo:{" "}
                                  <span className="font-semibold">
                                    {formatHours(topFileHours)}
                                  </span>
                                </span>
                                <span>
                                  {topFileShare}% do esforço deste usuário
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Histórico de arquivos (últimas 20) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4 text-primary" />
                  Últimas alterações (20)
                </span>
                {history.length > 20 && (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    Ver tudo
                  </Button>
                )}
              </CardTitle>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Linha do tempo resumida das últimas modificações de arquivos
                relacionadas a esta tarefa.
              </p>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ScrollArea className="h-full pr-2">
                {lastHistoryEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum histórico registrado ainda.
                  </p>
                ) : (
                  <div className="space-y-2 text-xs">
                    {lastHistoryEntries.map((entry) => {
                      const userInfo = users.find(
                        (u) => u._id === entry.userId,
                      );
                      const label =
                        entry.userId && userInfo
                          ? `${userInfo.name}${
                              userInfo.username ? ` (${userInfo.username})` : ""
                            }`
                          : entry.userId
                            ? entry.userId
                            : "Usuário não informado";

                      const minutes = parseFloat(entry.elapsedTime || "0") || 0;

                      return (
                        <div
                          key={entry._id}
                          className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="mt-0.5">
                              <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="font-medium truncate">
                                {entry.filePath}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleString()}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Editor: {label}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-[11px] font-medium">
                              {formatHours(minutes / 60)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL: todos os registros, com filtro por usuário */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Histórico completo da tarefa</DialogTitle>
            <DialogDescription>
              Visualize todas as alterações de arquivos desta tarefa e filtre
              por usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-xs text-muted-foreground">
              Total de registros:{" "}
              <span className="font-medium">{history.length}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span>Filtrar por usuário:</span>
              <Select
                value={historyFilterUserId}
                onValueChange={(v) =>
                  setHistoryFilterUserId(v as "all" | string)
                }
              >
                <SelectTrigger className="h-8 w-[220px] text-xs">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name}
                      {u.username ? ` (${u.username})` : ""}
                    </SelectItem>
                  ))}
                  {hasUnknownUser && (
                    <SelectItem value="unknown">
                      Usuário não informado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1">
            <ScrollArea className="h-full pr-2">
              {filteredHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum registro encontrado para o filtro selecionado.
                </p>
              ) : (
                <div className="space-y-2 text-xs">
                  {filteredHistory.map((entry) => {
                    const userInfo = users.find((u) => u._id === entry.userId);
                    const label =
                      entry.userId && userInfo
                        ? `${userInfo.name}${
                            userInfo.username ? ` (${userInfo.username})` : ""
                          }`
                        : entry.userId
                          ? entry.userId
                          : "Usuário não informado";

                    const minutes = parseFloat(entry.elapsedTime || "0") || 0;

                    return (
                      <div
                        key={entry._id}
                        className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="mt-0.5">
                            <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-medium truncate">
                              {entry.filePath}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString()}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Editor: {label}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[11px] font-medium">
                            {formatHours(minutes / 60)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDetailPage;
