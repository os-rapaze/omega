"use client"

import { useState } from "react"
import { Search, Plus, MessageCircle, Paperclip, ArrowLeft, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface Task {
  id: string
  title: string
  status: string
  date: string
  avatar: string
  comments: number
  attachments: number
}

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

export default function KanbanBoard() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark")
  }
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "A Fazer",
      color: "bg-blue-500",
      tasks: [
        {
          id: "1",
          title: "Lorem Ipsum",
          status: "Não Iniciado",
          date: "13 Mar, 2025",
          avatar: "https://www.infomoney.com.br/wp-content/uploads/2025/03/2025-03-13T174459Z_1_LYNXMPEL2C0WI_RTROPTP_4_USA-NATO.jpg?fit=1280%2C854&quality=50&strip=all",
          comments: 3,
          attachments: 1,
        },
      ],
    },
    {
      id: "progress",
      title: "Em Andamento",
      color: "bg-orange-500",
      tasks: [
        {
          id: "2",
          title: "Lorem Ipsum",
          status: "Não Iniciado",
          date: "11 Mar, 2025",
          avatar: "https://upload.wikimedia.org/wikipedia/commons/f/f4/USAFA_Hosts_Elon_Musk_%28Image_1_of_17%29_%28cropped%29.jpg",
          comments: 3,
          attachments: 1,
        },
      ],
    },
    {
      id: "completed",
      title: "Tarefa Concluída",
      color: "bg-green-500",
      tasks: [],
    },
  ])

const TaskCard = ({ task }: { task: Task }) => (
  <Card className="bg-background border border-border mb-2 hover:bg-muted transition-colors">
    <CardContent className="p-3">
      <div className="flex items-start gap-2 mb-2">
        <img 
          src={task.avatar || "/placeholder.svg"} 
          alt="Avatar" 
          className="w-12 h-12 rounded-full" 
        />
        <div className="flex-1">
          <h3 className="text-card-foreground font-medium text-sm leading-tight">
            {task.title}
          </h3>
          <p className="text-muted-foreground text-xs">{task.status}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-3 h-3" />
            <span className="text-xs">{task.comments}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Paperclip className="w-3 h-3" />
            <span className="text-xs">{task.attachments}</span>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">{task.date}</span>
      </div>
    </CardContent>
  </Card>
)

 const Column = ({ column }: { column: Column }) => (
  <div className="w-80 rounded-lg p-3 shadow-sm flex flex-col h-[calc(100vh-180px)]">
    {/* Cabeçalho da coluna */}
    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${column.color}`} />
        <h2 className="text-foreground font-medium text-sm">{column.title}</h2>
        <span className="text-muted-foreground text-xs ml-1">
          ({column.tasks.length})
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground hover:bg-muted h-6 w-6 p-0"
      >
        <Plus className="w-3 h-3" />
      </Button>
    </div>

    {/* Lista de tarefas */}
    <div className="mt-2 flex-1 overflow-y-auto">
      {column.tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  </div>
)


  return (
    <div className="min-h-screen bg-background text-foreground"> 
      {/* Search and Filter */}
      <div className="px-6 pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Digite para Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted border-border text-foreground placeholder-muted-foreground focus:border-ring"
            />
          </div>
          <Button variant="outline" className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
            Todos
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
          <div className="p-4">
            <div className="flex gap-4 overflow-x-auto">
              {columns.map((column) => (
                <Column key={column.id} column={column} />
        ))}
        </div>
      </div>  
    </div>
  )
}
