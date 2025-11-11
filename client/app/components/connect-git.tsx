import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Github } from "lucide-react";
import { useState } from "react";

export default function GitHubConnection() {
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!username.trim()) return;

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      alert(`Conectando ao GitHub com usuário: ${username}`);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && username.trim()) {
      handleConnect();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Github className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Conectar GitHub
          </h1>
          <p className="text-slate-400">
            Sincronize sua conta GitHub para acessar seus repositórios
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border border-slate-700 p-8 shadow-2xl">
          <div className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Nome de Usuário GitHub
              </label>
              <Input
                placeholder="seu-usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isConnecting}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Connect Button */}
            <Button
              onClick={handleConnect}
              disabled={!username.trim() || isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {isConnecting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Conectando...
                </span>
              ) : (
                "Conectar"
              )}
            </Button>
          </div>
        </Card>

        {/* Info Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-white mb-4">
            O que você pode fazer:
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Acessar todos os seus repositórios</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Gerenciar issues e pull requests</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 flex-shrink-0 mt-0.5">✓</span>
              <span>Sincronizar automaticamente</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Seus dados são protegidos e nunca compartilhados
        </p>
      </div>
    </div>
  );
}
