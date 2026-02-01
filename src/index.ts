import { type Context, Hono } from "hono";
import { createRequestHandler } from "react-router";
import createApiRoutes from "./api/routes";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Mount API routes at root — createApiRoutes defines the full paths
// (e.g. /api/interceptors, /proxy/:id/*, /monitor/:id)
const apiRoutes = createApiRoutes();
app.route("/", apiRoutes);

// Handle React Router SSR
const reactRouterHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

// Fallback: React Router for all other paths
app.all("*", async (c: Context<{ Bindings: CloudflareBindings }>) => {
  return await reactRouterHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
