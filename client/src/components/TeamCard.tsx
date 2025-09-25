import React from "react";
import { ChevronDown, ChevronUp, Users, Mail, Phone } from "lucide-react";
import { Team } from "../data/mockData";

interface TeamCardProps {
  team: Team;
  isExpanded: boolean;
  onToggle: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  isExpanded,
  onToggle,
}) => {
  const getStatusColor = (status: "online" | "offline") => {
    return status === "online" ? "bg-green-500" : "bg-gray-400";
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-input/30 border rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-750">
      {/* Header do Card */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${team.category === "Backend" ? "bg-purple-500" : "bg-green-500"}`}
          ></div>
          <div>
            <h3 className="text-white font-medium">{team.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
              <span className="flex items-center space-x-1">
                <Users size={14} />
                <span>{team.memberCount} membros</span>
              </span>
              <span>Progresso: {team.progress}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <button className="text-xs bg-input/40 text-gray-300 px-3 py-1 rounded hover:bg-input transition-colors">
              Acessar Tarefas
            </button>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-gray-400" size={20} />
          ) : (
            <ChevronDown className="text-gray-400" size={20} />
          )}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4">
          <div className="bg-input/50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 font-medium mb-3 pb-2 border-b border-gray-700">
              <span>Nome Completo</span>
              <span>Endereço de E-mail</span>
              <span>Número de Celular</span>
            </div>

            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-3 gap-4 items-center py-2 hover:bg-gray-800 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(member.status)}`}
                      ></div>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        @{member.name.toLowerCase().replace(/\s+/g, "")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Mail size={14} className="text-gray-500" />
                    <span>{member.email}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <Phone size={14} className="text-gray-500" />
                    <span>{member.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
