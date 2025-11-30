import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/", "routes/welcome.tsx"),

  route("/app", "routes/__protected.tsx", [
    route("home", "routes/homee.tsx"),
    route("github", "routes/git-connect.tsx"),
    route(":handle", "routes/__protected.project.tsx", [
      route("teams", "routes/teams.tsx"),
      route("tasks", "routes/kanban.tsx"),
      route("tasks/:tarefaId", "routes/task-detail.tsx"),
    ]),
    index("routes/dashboard.tsx"),
  ]),
] satisfies RouteConfig;
