import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const agentsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const agents = await ctx.db.agent.findMany({
      select: {
        id: true,
        constitution: true,
        name: true,
      },
    });

    return agents;
  }),
  getMessages: publicProcedure
    .input(z.object({ id: z.string(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.message.findMany({
        where: { groupId: input.id },
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
          agent: { select: { id: true, name: true } },
          user: { select: { id: true, userName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit ?? 20,
      });

      return messages;
    }),
});
