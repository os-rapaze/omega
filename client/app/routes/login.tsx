"use client";

import React from "react";
import { LoginForm } from "~/components/login-form";

const API_URL = process.env.API_URL ?? "http://localhost:2908";

export async function loader({ request }: { request: Request }) {
  const cookie = request.headers.get("cookie") ?? "";

  let token = cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("access_token="))
    ?.split("=")[1];

  if (token) {
    token = decodeURIComponent(token);
    token = token.replace(/^Bearer\s+/i, "");

    const res = await fetch(`${API_URL}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    if (res.ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/" },
      });
    }
  }

  return null;
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"></div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
