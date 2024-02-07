import { FastifyInstance } from "fastify";
import { redis } from "../../lib/redis";
import { z } from "zod";

export async function pollResults(app: FastifyInstance) {
  app.get("/polls/:pollId/results",{ websocket: true },async (connection, request) => {
      
    }
  );
}

