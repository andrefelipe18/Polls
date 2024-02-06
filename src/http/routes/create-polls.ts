import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", async (request, reply) => {
    const { title, options } = z.object({
      title: z.string(),
      options: z.array(z.string()),
    }).parse(request.body);

    const poll = await p.poll.create({
      data: {
        title,
        options: { // Cria as opções do poll no mesmo momento que o poll
          createMany: {
            data: options.map((option) => ({
              title: option,
            })),
          },
        },
      },
    });

    await p.pollOption.createMany({
      data: options.map((option) => ({
        pollId: poll.id,
        title: option,
      })),
    });

    return reply.code(201).send({
      poll,
    });
  });
}

