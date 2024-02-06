import { FastifyInstance } from "fastify";
import p from "../../lib/prisma";
import { z } from "zod";

export async function createPoll(app: FastifyInstance) {
  app.post("/polls", async (request, reply) => {
    const createPollBody = z.object({
      title: z.string(),
    });

    const { title } = createPollBody.parse(request.body);

    const poll = await p.poll.create({
      data: {
        title,
      },
    });

    return reply.code(201).send({
      polldId: poll.id,
    });
  });
}

