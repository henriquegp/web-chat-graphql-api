import { Request, Response } from 'express';
import { PubSub } from 'apollo-server-express';
import { UserProps } from '../models/User';

export interface Context {
  req: Request;
  res: Response;
  user?: UserProps;
  pubsub: PubSub;
}

export interface ConnectionContext {
  user?: UserProps;
  pubsub: PubSub;
}
