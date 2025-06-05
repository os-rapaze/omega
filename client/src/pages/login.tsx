"use client";

import React from "react";
import {Button, Input, Checkbox, Link, Form, Divider} from "@heroui/react";
import {Icon} from "@iconify/react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/components/hooks/useDocumentTitle";

export default function LoginPage() {
  useDocumentTitle("Login - Projeto Ômega")

  const [isVisible, setIsVisible] = React.useState(false);
  const [usuarios, setUsuarios] = React.useState([]);
  const [formData, setFormData] = React.useState({ email: "", password: "" });

  const navigate = useNavigate();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Falha no login");
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Entre na sua conta</h1>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={formData.password}
            onChange={handleInputChange}
          />
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm">
              Lembrar-me
            </Checkbox>
            <Link className="text-default-500" href="#" size="sm">
              Esqueceu a senha?
            </Link>
          </div>
          <Button className="w-full" variant="shadow" color="primary" type="submit">
            Entrar
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OU</p>
          <Divider className="flex-1" />
        </div> 
        <p className="text-center text-small">
          Precisa criar uma conta?&nbsp;
          <Link href="/signup" size="sm">
            Registre-se
          </Link>
        </p>
        <ThemeSwitch className="hidden"/>
      </div>
    </div>
  );
}
