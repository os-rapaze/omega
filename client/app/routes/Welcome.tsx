import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ChevronLeft, Upload, AlertCircle, Loader2 } from "lucide-react";
import { themes, applyTheme, type ThemeName } from "~/lib/themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface OnboardingData {
  theme: ThemeName | null;
  name: string;
  username: string;
  email: string;
  workspaceName: string;
  workspaceDescription: string;
  workspaceIcon: string | null;
  projectName: string;
  projectDescription: string;
  githubToken: string;
  groqApiKey: string;
}

interface SubStep {
  id: string;
  title: string;
  description: string;
  inputType?: "text" | "email" | "textarea" | "file";
  inputPlaceholder?: string;
  field?: keyof OnboardingData;
  required: boolean;
  showVideoPlaceholder?: boolean;
}

interface Stage {
  id: string;
  name: string;
  introText: string;
  subSteps: SubStep[];
}

const STORAGE_KEY = "onboarding_progress";

export default function Welcome() {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [showStageIntro, setShowStageIntro] = useState(false);
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullscreenLoading, setShowFullscreenLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [data, setData] = useState<OnboardingData>({
    theme: null,
    name: "",
    username: "",
    email: "",
    workspaceName: "",
    workspaceDescription: "",
    workspaceIcon: null,
    projectName: "",
    projectDescription: "",
    githubToken: "",
    groqApiKey: "",
  });

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        JSON.parse(savedProgress);
        setShowResumeDialog(true);
      } catch (error) {
        console.error("Error loading saved progress:", error);
      }
    }
  }, []);

  // Save progress to localStorage whenever data changes
  useEffect(() => {
    const progressData = {
      currentStage,
      currentSubStep,
      data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
  }, [currentStage, currentSubStep, data]);

  const resumeProgress = () => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCurrentStage(progress.currentStage);
        setCurrentSubStep(progress.currentSubStep);
        setData(progress.data);
        setShowResumeDialog(false);
      } catch (error) {
        console.error("Error resuming progress:", error);
        setShowResumeDialog(false);
      }
    }
  };

  const startFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStage(0);
    setCurrentSubStep(0);
    setData({
      theme: null,
      name: "",
      username: "",
      email: "",
      workspaceName: "",
      workspaceDescription: "",
      workspaceIcon: null,
      projectName: "",
      projectDescription: "",
      githubToken: "",
      groqApiKey: "",
    });
    setShowResumeDialog(false);
  };

  useEffect(() => {
    if (data.theme) {
      applyTheme(themes[data.theme]);
    }
  }, [data.theme]);

  // Auto-focus input when it appears
  useEffect(() => {
    if (inputRef.current && !showStageIntro) {
      inputRef.current.focus();
    }
  }, [currentStage, currentSubStep, showStageIntro]);

  // Show intro when entering new stage
  useEffect(() => {
    if (currentStage > 0 && currentSubStep === 0 && !showResumeDialog) {
      setShowStageIntro(true);
      const timer = setTimeout(() => {
        setShowStageIntro(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStage, showResumeDialog]);

  const stages: Stage[] = [
    {
      id: "theme",
      name: "Escolha de Tema",
      introText: "",
      subSteps: [
        {
          id: "theme-select",
          title: "Escolha seu tema",
          description: "Selecione o estilo visual que mais combina com você",
          required: true,
        },
      ],
    },
    {
      id: "user",
      name: "Criação de Usuário",
      introText: "Vamos começar conhecendo você...",
      subSteps: [
        {
          id: "name",
          title: "Qual é o seu nome?",
          description: "Como você gostaria de ser chamado?",
          inputType: "text",
          inputPlaceholder: "Digite seu nome completo",
          field: "name",
          required: true,
        },
        {
          id: "username",
          title: "Escolha um nome de usuário",
          description: "Este será seu identificador único",
          inputType: "text",
          inputPlaceholder: "Digite seu username",
          field: "username",
          required: true,
        },
        {
          id: "email",
          title: "Qual é o seu e-mail?",
          description: "Opcional - para recuperação de conta",
          inputType: "email",
          inputPlaceholder: "Digite seu e-mail (opcional)",
          field: "email",
          required: false,
        },
      ],
    },
    {
      id: "workspace",
      name: "Criação de Workspace",
      introText: "Agora vamos criar seu espaço de trabalho...",
      subSteps: [
        {
          id: "workspace-name",
          title: "Crie seu workspace",
          description: "Escolha um nome para seu espaço de trabalho",
          inputType: "text",
          inputPlaceholder: "Nome do workspace",
          field: "workspaceName",
          required: true,
        },
        {
          id: "workspace-description",
          title: "Descreva seu workspace",
          description: "Conte um pouco sobre o propósito deste espaço",
          inputType: "textarea",
          inputPlaceholder: "Descrição do workspace",
          field: "workspaceDescription",
          required: true,
        },
        {
          id: "workspace-cover",
          title: "Ícone do workspace",
          description:
            "Adicione uma imagem quadrada para representar seu workspace",
          inputType: "file",
          field: "workspaceCover",
          required: false,
        },
      ],
    },
    {
      id: "project",
      name: "Criação de Projeto",
      introText: "Por fim, vamos criar seu primeiro projeto...",
      subSteps: [
        {
          id: "project-name",
          title: "Crie seu primeiro projeto",
          description: "Qual será o nome do seu projeto?",
          inputType: "text",
          inputPlaceholder: "Nome do projeto",
          field: "projectName",
          required: true,
        },
        {
          id: "project-description",
          title: "Descreva seu projeto",
          description: "O que você pretende construir?",
          inputType: "textarea",
          inputPlaceholder: "Descrição do projeto",
          field: "projectDescription",
          required: true,
        },
        {
          id: "github-token",
          title: "Conecte ao GitHub",
          description: "Cole seu token de acesso pessoal para integração",
          inputType: "text",
          inputPlaceholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
          field: "githubToken",
          required: true,
          showVideoPlaceholder: true,
        },
        {
          id: "groq-api-key",
          title: "Conecte ao Groq AI",
          description: "Cole sua API key do Groq para habilitar IA",
          inputType: "text",
          inputPlaceholder: "gsk_xxxxxxxxxxxxxxxxxxxx",
          field: "groqApiKey",
          required: true,
          showVideoPlaceholder: true,
        },
      ],
    },
  ];

  const stage = stages[currentStage];
  const subStep = stage.subSteps[currentSubStep];
  const totalSubSteps = stage.subSteps.length;
  const isLastSubStep = currentSubStep === totalSubSteps - 1;
  const isLastStage = currentStage === stages.length - 1;
  const isFirstStage = currentStage === 0;

  const handleNext = async () => {
    // Theme selection validation
    if (currentStage === 0 && !data.theme) {
      return;
    }

    // Input validation
    if (subStep.field && subStep.required) {
      const value = data[subStep.field];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return;
      }
    }

    // Move to next sub-step or stage
    if (isLastSubStep) {
      // Send data to API at the end of each stage (except theme selection)
      if (currentStage > 0) {
        setIsSubmitting(true);
        setShowFullscreenLoading(true);

        try {
          let endpoint = "";
          let payload = {};
          let message = "";

          switch (currentStage) {
            case 1: // User stage
              endpoint = "https://api.example.com/onboarding/user";
              payload = {
                name: data.name,
                username: data.username,
                email: data.email,
              };
              message = "Criando seu perfil...";
              break;
            case 2: // Workspace stage
              endpoint = "https://api.example.com/onboarding/workspace";
              payload = {
                workspaceName: data.workspaceName,
                workspaceDescription: data.workspaceDescription,
                workspaceCover: data.workspaceCover,
              };
              message = "Configurando seu workspace...";
              break;
            case 3: // Project stage
              endpoint = "https://api.example.com/onboarding/project";
              payload = {
                projectName: data.projectName,
                projectDescription: data.projectDescription,
                githubToken: data.githubToken,
                groqApiKey: data.groqApiKey,
              };
              message = "Conectando integrações...";
              break;
          }

          setLoadingMessage(message);

          if (endpoint) {
            const response = await axios.post(endpoint, payload);
            console.log(`${stage.name} data sent successfully:`, response.data);
          }

          // If it's the last stage, show final preparation messages
          if (isLastStage) {
            const messages = [
              "Estamos preparando tudo para você...",
              "Configurando seu ambiente...",
              "Quase lá...",
              "Finalizando configurações...",
            ];

            for (let i = 0; i < messages.length; i++) {
              setLoadingMessage(messages[i]);
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            // Redirect to Google.com
            window.location.href = "https://www.google.com";
            return;
          }
        } catch (error) {
          console.error(`Error sending ${stage.name} data:`, error);
          setLoadingMessage("Erro ao enviar dados. Tentando novamente...");
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } finally {
          setIsSubmitting(false);
          setShowFullscreenLoading(false);
        }
      }

      if (!isLastStage) {
        // Move to next stage
        setCurrentStage(currentStage + 1);
        setCurrentSubStep(0);
      }
    } else {
      setCurrentSubStep(currentSubStep + 1);
    }
  };

  const handleBack = () => {
    if (isFirstStage && currentSubStep === 0) {
      return;
    }

    // If at first sub-step of a stage, show dialog to go back to previous stage
    if (currentSubStep === 0 && currentStage > 0) {
      setShowBackDialog(true);
    } else {
      // Go back within current stage
      setCurrentSubStep(currentSubStep - 1);
    }
  };

  const clearProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleBackToPreviousStage = () => {
    setShowBackDialog(false);
    setCurrentStage(currentStage - 1);
    setCurrentSubStep(0);
  };

  const handleInputChange = (value: string) => {
    if (subStep.field) {
      setData({ ...data, [subStep.field]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && subStep.field) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, [subStep.field!]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeSelect = (theme: ThemeName) => {
    setData({ ...data, theme });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && subStep.inputType !== "textarea") {
      handleNext();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 },
    },
  };

  if (showResumeDialog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-8 max-w-md text-center space-y-6 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-foreground">
            Bem-vindo de volta!
          </h2>
          <p className="text-foreground/60">
            Detectamos um progresso anterior. Deseja retomar de onde parou?
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={resumeProgress} className="px-6 py-2">
              Retomar
            </Button>
            <Button
              onClick={startFresh}
              variant="outline"
              className="px-6 py-2"
            >
              Começar do Zero
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      {/* Animated background circles */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl px-8">
        <AnimatePresence mode="wait">
          {showStageIntro ? (
            <motion.div
              key="stage-intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <p className="text-4xl md:text-5xl text-foreground/80 font-light">
                {stage.introText}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${currentStage}-${currentSubStep}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center text-center space-y-8"
            >
              {/* Title */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-bold tracking-tight text-foreground"
              >
                {subStep.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl text-foreground/60 max-w-xl"
              >
                {subStep.description}
              </motion.p>

              {/* Theme Selector */}
              {currentStage === 0 && (
                <motion.div
                  variants={inputVariants}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8"
                >
                  {Object.values(themes).map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme.id)}
                      className={`relative p-8 rounded-2xl transition-all duration-300 ${
                        data.theme === theme.id
                          ? "scale-105 shadow-2xl ring-2 ring-foreground/20"
                          : "hover:scale-102 hover:shadow-lg"
                      }`}
                      style={{
                        backgroundColor: theme.colors.card,
                      }}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div
                          className="w-20 h-20 rounded-full"
                          style={{
                            backgroundColor: theme.colors.primary,
                          }}
                        />
                        <h3 className="text-2xl font-bold text-foreground">
                          {theme.name}
                        </h3>
                        <p className="text-sm text-foreground/60">
                          {theme.description}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Input Fields */}
              {currentStage > 0 && (
                <motion.div
                  variants={inputVariants}
                  className="w-full max-w-xl mt-8"
                >
                  {/* GitHub/Groq themed section */}
                  {subStep.showVideoPlaceholder && (
                    <div className="mb-8 space-y-6">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <img
                          src={
                            subStep.id === "github-token"
                              ? "/github-icon.png"
                              : "/groq-logo.png"
                          }
                          alt={
                            subStep.id === "github-token" ? "GitHub" : "Groq"
                          }
                          className={
                            subStep.id === "github-token"
                              ? "w-16 h-16"
                              : "w-32 h-16 object-contain"
                          }
                        />
                        <div className="text-left">
                          <h3 className="text-2xl font-semibold text-foreground">
                            {subStep.id === "github-token"
                              ? "GitHub"
                              : "Groq AI"}
                          </h3>
                          <p className="text-sm text-foreground/60">
                            {subStep.id === "github-token"
                              ? "Conecte sua conta"
                              : "Habilite IA no projeto"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`relative w-full aspect-video rounded-xl overflow-hidden mb-6 border border-foreground/10 ${
                          subStep.id === "github-token"
                            ? "bg-gradient-to-br from-[#24292e] to-[#1a1e22]"
                            : "bg-gradient-to-br from-[#f55036] to-[#d43f2b]"
                        }`}
                      >
                        <img
                          src="/video-placeholder.svg"
                          alt="Tutorial em breve"
                          className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-xl font-medium text-white/90">
                            Vídeo tutorial em breve
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subStep.inputType === "file" ? (
                    <div className="flex flex-col items-center space-y-4">
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-48 h-48 rounded-xl cursor-pointer bg-background/50 hover:bg-background/70 transition-all duration-300"
                      >
                        <Upload className="w-12 h-12 text-foreground/40 mb-4" />
                        <span className="text-sm text-center text-foreground/60 px-4">
                          Clique para fazer upload
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      {data.workspaceCover && (
                        <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-foreground/20">
                          <img
                            src={data.workspaceCover}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ) : subStep.inputType === "textarea" ? (
                    <Textarea
                      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                      value={
                        subStep.field ? (data[subStep.field] as string) : ""
                      }
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={subStep.inputPlaceholder}
                      className="w-full text-xl md:text-2xl text-center bg-transparent border-0 rounded-none px-4 py-6 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-foreground/30"
                      rows={4}
                    />
                  ) : (
                    <input
                      ref={inputRef as React.RefObject<HTMLInputElement>}
                      type={subStep.inputType}
                      value={
                        subStep.field ? (data[subStep.field] as string) : ""
                      }
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={subStep.inputPlaceholder}
                      className="w-full text-xl md:text-2xl text-center bg-transparent border-0 rounded-none px-4 py-6 outline-none placeholder:text-foreground/30 transition-all duration-300"
                    />
                  )}
                  {subStep.required && (
                    <p className="text-sm text-foreground/40 mt-2">
                      * Campo obrigatório
                    </p>
                  )}
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mt-8"
              >
                {!(isFirstStage && currentSubStep === 0) && (
                  <Button
                    onClick={handleBack}
                    variant="ghost"
                    size="lg"
                    className="gap-2 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Voltar
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  size="lg"
                  disabled={
                    isSubmitting ||
                    (currentStage === 0 && !data.theme) ||
                    (subStep.field && subStep.required && !data[subStep.field])
                  }
                  className="gap-2 bg-foreground/10 hover:bg-foreground/20 text-foreground border-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      {isLastStage && isLastSubStep ? "Começar" : "Continuar"}
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator - Shows sub-steps progress within current stage */}
        {!showStageIntro && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 z-0">
            <p className="text-sm text-foreground/40">
              {stage.name} - {currentSubStep + 1} de {totalSubSteps}
            </p>
            <div className="flex gap-2">
              {stage.subSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSubStep
                      ? "w-8 bg-foreground/60"
                      : index < currentSubStep
                        ? "w-2 bg-foreground/40"
                        : "w-2 bg-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Loading */}
      <AnimatePresence>
        {showFullscreenLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mb-8"
            >
              <Loader2 className="w-16 h-16 text-foreground/60" />
            </motion.div>
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl md:text-3xl text-foreground/80 font-light text-center px-8"
            >
              {loadingMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to Previous Stage Dialog */}
      <Dialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <DialogContent className="bg-card border-foreground/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5" />
              Voltar para etapa anterior?
            </DialogTitle>
            <DialogDescription className="text-foreground/60">
              Você está no início da etapa "{stage.name}". Deseja voltar para a
              etapa anterior "{stages[currentStage - 1]?.name}" e refazê-la
              desde o começo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowBackDialog(false)}
              className="text-foreground/60 hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBackToPreviousStage}
              className="bg-foreground/10 hover:bg-foreground/20 text-foreground"
            >
              Sim, voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
