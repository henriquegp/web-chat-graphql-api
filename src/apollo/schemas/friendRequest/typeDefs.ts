import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type FriendRequest {
    id: String!
    from: User!
    to: String!
  }

  extend type Query {
    friends: [User!]! @auth
    friendRequests: [FriendRequest!]! @auth
  }

  extend type Mutation {
    friendRequest(userId: String!): Boolean! @auth
    acceptFriendRequest(requestId: String!): Boolean! @auth
    rejectFriendRequest(requestId: String!): Boolean! @auth
  }
`;

export default typeDefs;
