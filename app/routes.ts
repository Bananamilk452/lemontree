import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("layouts/home.tsx", [index("routes/home.tsx")]),
  route("api/*", "routes/api.tsx"),

  layout("layouts/auth.tsx", [
    route("sign-in", "routes/sign-in.tsx"),
    route("sign-up", "routes/sign-up.tsx"),
    route("forgot-password", "routes/forgot-password.tsx"),
    route("reset-password", "routes/reset-password.tsx"),
  ]),
] satisfies RouteConfig;
