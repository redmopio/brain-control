import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const groupsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.db.group.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        connector: { select: { name: true } },
      },
    });

    return rooms;
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
