import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";
import { randomUUID } from "node:crypto";

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

    let { sessionId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID() + new Date().toISOString();
    }

    reply.setCookie("sessionId", sessionId, {
      path: "/",
      maxAge: 60 * 60 * 30, //30 dias
      httpOnly: true,
      signed: true,
    });

    reply.send({ sessionId });
  });
}

