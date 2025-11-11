export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw new Response("Unauthorized", {
      status: 302,
      headers: { Location: "/login" },
    });
  }
  return user;
}
