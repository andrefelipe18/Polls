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

    if (sessionId) {
      const userPreviousVote = await p.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      });

      if (userPreviousVote && userPreviousVote.pollOptionId !== pollOptionId) {
        await p.vote.delete({
          where: {
            id: userPreviousVote.id,
          },
        });

        const vote = await p.vote.create({
          data: {
            pollOptionId,
            pollId,
            sessionId,
          },
        });
      } else if (userPreviousVote) {
        return reply.code(400).send({
          message: "User already voted",
        });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID() + new Date().toISOString();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 30, //30 dias
        httpOnly: true,
        signed: true,
      });
    }

    const vote = await p.vote.create({
      data: {
        pollOptionId,
        pollId,
        sessionId,
      },
    });

    return reply.code(201).send({
      message: "Vote registered",
    });
  });
}

