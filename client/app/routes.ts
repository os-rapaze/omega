import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/login", "routes/login.tsx"),
  route("/", "routes/home.tsx"),

  route("/:handle", "routes/__protected.tsx", [
    index("routes/dashboard.tsx"),
    route("home", "routes/homee.tsx"),
    route("github", "routes/git-connect.tsx"),
    route("kanban", "routes/kanban.tsx"),
    route("teams", "routes/teams.tsx"),
  ]),
] satisfies RouteConfig;
