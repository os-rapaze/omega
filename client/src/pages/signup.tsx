"use client";

import React from "react";
import { Button, Input, Checkbox, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useDocumentTitle } from "@/components/hooks/useDocumentTitle"

export default function SignUpPage() {
  useDocumentTitle("Registre-se - Projeto Ômega");

  const [isVisible, setIsVisible] = React.useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (!res.ok) {
        throw new Error("Falha no cadastro");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      alert("Cadastro realizado com sucesso!");
      // Redirecionar para dashboard ou login
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Crie uma conta</h1>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Nome de Usuário"
            name="name"
            placeholder="Digite seu nome"
            type="text"
            variant="bordered"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Input
            isRequired
            label="Email"
            name="email"
            placeholder="Digite seu email"
            type="email"
            variant="bordered"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
                />
              </button>
            }
            label="Senha"
            name="password"
            placeholder="Digite sua senha"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={formData.password}
            onChange={handleInputChange}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleConfirmVisibility}>
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon={isConfirmVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
                />
              </button>
            }
            label="Confirmar Senha"
            name="confirmPassword"
            placeholder="Confirme sua senha"
            type={isConfirmVisible ? "text" : "password"}
            variant="bordered"
            value={formData.confirmPassword}
            onChange={handleInputChange}
          />
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm">
              Lembrar-me
            </Checkbox>
          </div>
          <Button className="w-full" variant="shadow" color="primary" type="submit">
            Cadastrar
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OU</p>
          <Divider className="flex-1" />
        </div>
        <p className="text-center text-small">
          Já tem uma conta?&nbsp;
          <Link href="/login" size="sm">
            Entre aqui
          </Link>
        </p>
        <ThemeSwitch className="hidden"/>
      </div>
    </div>
  );
}

