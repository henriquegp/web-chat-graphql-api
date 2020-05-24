import http from 'http';
import path from 'path';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import 'dotenv/config';
import './database';

import apolloConfig from './apollo';

const app = express();

const server = new ApolloServer(apolloConfig);

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.use(
  '/files',
  express.static(path.resolve(__dirname, '..', 'temp')),
);

const { APP_PORT } = process.env;
httpServer.listen(APP_PORT, () => console.log(`Server online on port: ${APP_PORT}`));
