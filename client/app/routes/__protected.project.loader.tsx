const API_URL = process.env.API_URL ?? "http://localhost:2908";

function getTokenFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";

  let token = cookie
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith("access_token="))
    ?.split("=")[1];

  if (!token) return null;

  token = decodeURIComponent(token);
  token = token.replace(/^Bearer\s+/i, "");

  return token;
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { handle?: string };
}) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw new Response("Unauthorized", {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  const handle = params.handle;

  if (!handle) {
    throw new Response("Projeto não especificado", { status: 400 });
  }

  const res = await fetch(`${API_URL}/api/projetos/${handle}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) {
    throw new Response("Projeto não encontrado", {
      status: 404,
    });
  }

  if (!res.ok) {
    throw new Response("Erro ao carregar projeto", {
      status: 500,
    });
  }

  const projeto = await res.json();

  return projeto;
}
