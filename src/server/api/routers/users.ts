import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const agents = await ctx.db.user.findMany({
      select: {
        id: true,
        jid: true,
        userName: true,
        phoneNumber: true,
        telegramId: true,
        createdAt: true,
        updatedAt: true,
        messages: { select: { _count: true } },
      },
      orderBy: [{ updatedAt: "asc" }, { userName: "asc" }],
    });

    return agents;
  }),
  updateOne: publicProcedure
    .input(z.object({ id: z.string(), userName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const messages = await ctx.db.user.update({
        where: { id: input.id },
        data: {
          userName: input.userName,
        }
      });

      return messages;
    }),
});
