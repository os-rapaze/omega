// routes/__protected.project.tsx
import { Outlet, useLoaderData } from "react-router";
import { loader } from "./__protected.project.loader";

export { loader };

export default function ProjectLayout() {
  const projeto = useLoaderData<typeof loader>();

  // Se quiser, pode usar dados do projeto aqui (nome, etc)
  return (
    <div className="flex flex-1 flex-col">
      <Outlet context={{ projeto }} />
    </div>
  );
}
