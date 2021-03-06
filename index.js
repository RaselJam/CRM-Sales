const { ApolloServer } = require("apollo-server");
const jwt = require("jsonwebtoken");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectarDB = require("./config/db");
require("dotenv").config();

//Conecting
connectarDB();

//Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log(req.headers["authorization"]);
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const user = jwt.verify(
          token.replace("Bearer ", ""),
          process.env.SECRET
        );
        return { user };
      } catch (error) {
        console.log("Error!", error);
      }
    }
  },
});
server.listen().then(({ url }) => {
  console.log(`Server running at URL ${url}`);
});
