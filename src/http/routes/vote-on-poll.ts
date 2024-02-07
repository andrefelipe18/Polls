import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { redis } from "../../lib/redis";
import { votingPubSub } from "../../utils/VotingPubSub";

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

        const votes = await redis.zincrby(
          pollId,
          -1,
          userPreviousVote.pollOptionId
        );

        votingPubSub.publish(pollId, {
          pollOptionId: userPreviousVote.pollOptionId,
          voteCount: Number(votes),
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
    console.log();
    await p.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    });

    const voteCount = await redis.zincrby(pollId, 1, pollOptionId);

    votingPubSub.publish(pollId, {
      pollOptionId,
      voteCount: Number(voteCount),
    });

    return reply.code(201).send({
      message: "Vote registered",
    });
  });
}

