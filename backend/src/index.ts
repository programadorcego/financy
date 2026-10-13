import "reflect-metadata";

import express from "express";
import cors from "cors";
import { env } from "./env";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { AuthResolver } from "./resolvers/auth.resolver";
import { HealthResolver } from "./resolvers/health.resolver";
import { CategoryResolver } from "./resolvers/category.resolver";
import { buildContext } from "./graphql/context";
import { TransactionResolver } from "./resolvers/transaction.resolver";

async function bootstrap() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  const schema = await buildSchema({
    resolvers: [
      HealthResolver,
      AuthResolver,
      CategoryResolver,
      TransactionResolver,
    ],
    validate: false,
  });

  const server = new ApolloServer({
    schema,
  });

  await server.start();

  app.use(
    "/graphql",
    express.json(),
    expressMiddleware(server, {
      context: buildContext,
    })
  );

  app.listen(env.PORT, () => {
    console.log(
      `Servidor GraphQL rodando em http://localhost:${env.PORT}/graphql`
    );
  });
}

bootstrap();