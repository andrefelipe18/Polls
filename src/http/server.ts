import fastify from "fastify";
import { createPoll } from "./routes/create-polls";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import { pollResults } from "./ws/poll-results";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";

const app = fastify();

app.register(cookie, {
  secret: "supersecretocookiedoapp",
  hook: "onRequest",
  parseOptions: {},
});

app.register(websocket);

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

//WebSockets
app.register(pollResults);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});

