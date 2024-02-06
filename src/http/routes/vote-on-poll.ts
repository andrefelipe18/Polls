import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";

export async function voteOnPoll(app: FastifyInstance) {
  app.post("/polls/:pollId/votes", async (request, reply) => {
    const { pollOptionId } = z
      .object({
        pollOptionId: z.string().uuid(),
      })
      .parse(request.body);

    const { pollId } = z
      .object({
        pollId: z.string().uuid(),
      })
      .parse(request.params);
  });
}

