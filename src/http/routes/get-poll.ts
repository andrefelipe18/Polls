import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";

export async function getPoll(app: FastifyInstance) {
  app.get("/polls/:pollId", async (request, reply) => {
    const { pollId } = z
      .object({
        pollId: z.string().uuid(),
      })
      .parse(request.params);

    const poll = await p.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return reply.code(200).send({
      poll,
    });
  });
}

