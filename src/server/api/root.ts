import { agentsRouter } from "@/server/api/routers/agents";
import { groupsRouter } from "@/server/api/routers/groups";
import { usersRouter } from "@/server/api/routers/users";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  groups: groupsRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
