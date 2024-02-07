import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";
import { redis } from "../../lib/redis";

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

    if (!poll) {
      return reply.code(404).send({
        message: "Poll not found :(",
      });
    }

    const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

    const votes = result.reduce((object, line, index) => { // Toda vez que um index for par, ele vai ser a chave do objeto, e o próximo elemento vai ser o valor
      if (index % 2 === 0) {
        object[line] = Number(result[index + 1]);
      }
      return object;
    }, {} as Record<string, number>);

    poll.options = poll.options.map((option) => { // Mapeando as opções da poll com o número de votos
      return {
        ...option,
        votes: votes[option.id] || 0,
      };
    });

    return reply.code(200).send({
      poll,
    });
  });
}

