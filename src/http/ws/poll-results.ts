import { FastifyInstance } from "fastify";
import { redis } from "../../lib/redis";
import { z } from "zod";
import { votingPubSub } from "../../utils/VotingPubSub";

export async function pollResults(app: FastifyInstance) {
  app.get("/polls/:pollId/results",{ websocket: true },
    async (connection, request) => {
        const {pollId} = z.object({
            pollId: z.string().uuid(),
        }).parse(request.params);

        votingPubSub.subscribe(pollId, (message) => {
            connection.socket.send(JSON.stringify(message));
        });
    }
  );
}

