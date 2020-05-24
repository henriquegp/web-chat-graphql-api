import { gql } from 'apollo-server-express';

const typeDefs = gql`
  scalar Upload
  directive @auth on FIELD_DEFINITION

  type User {
    id: String
    username: String!
    name: String!
    picture: String
    status: String!
  }

  type LoginResponse {
    user: User!
    token: String!
  }

  input UserInput {
    username: String!
    name: String!
    password: String!
    confirmPassword: String!
  }

  type SearchUsersResponse {
    id: String
    username: String!
    name: String!
    picture: String
    isFriends: Boolean!
    requestId: String
  }

  type Query {
    currentUser: User! @auth
    user(userId: String!): User! @auth
    hello: [User!]! @auth
    searchUsers(name: String!): [SearchUsersResponse!]! @auth
  }

  type Mutation {
    login(username: String!, password: String!): LoginResponse! 
    register(user: UserInput!): String!
    setUserPicture(file: Upload!): Boolean! @auth
    setUserStatus(status: String!): Boolean @auth
  }

  type NewStatusResponse {
    id: String!
    status: String!
  }

  type Subscription  {
    userStatus: NewStatusResponse!
  }
`;

export default typeDefs;
