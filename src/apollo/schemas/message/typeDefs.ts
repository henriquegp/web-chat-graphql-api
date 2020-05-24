import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Message {
    id: String!
    from: String!
    to: String!
    text: String!
  }

  extend type Query {
    messages(userId: String!): [Message!]! @auth
  }

  extend type Mutation {
    sendMessage(userId: String!, text: String!): Message! @auth
  }

  extend type Subscription {
    chatMessage(userId: String!): Message!
  }
`;

export default typeDefs;
