import { Outlet, useLoaderData } from "react-router";
const API_URL = process.env.API_URL ?? "http://localhost:2908";

export async function loader({ request }: { request: Request }) {
  const cookie = request.headers.get("cookie") ?? "";

  let token = cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("access_token="))
    ?.split("=")[1];

  if (!token) {
    throw new Response("Unauthorized", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  token = decodeURIComponent(token);

  token = token.replace(/^Bearer\s+/i, "");

  const res = await fetch(`${API_URL}/api/auth/validate`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Response("Unauthorized", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  return await res.json();
}
