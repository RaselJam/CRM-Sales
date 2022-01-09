const { gql } = require("apollo-server");
//schema
const typeDefs = gql`
 type Token {
  token : String
 }
  type Product {
    id :ID
    name: String
    stock : Int
    price: Float
    createdAt: String

  }
  type User {
    id:ID
    name : String
    lastName : String
    email: String
    createdAt : String
  }

  type Client {
    
    id:ID
    name : String
    lastName : String
    company : String
    email: String
    tel: String
    salesMan : ID
    createdAt : String
  }
  type OrderProduct {
    id: ID
    quantity:Int
  }

  type Order {
    id:ID
    orderProducts : [OrderProduct]
    total :Float
    client : ID
    salesMan : ID
    state : String
    createdAt : String
  }

  type TopClient {
    total : Float
    client : [Client]
  }
   type TopSalesman {
     total : Float
     salesMan : [User]


   }
  input UserInput {
    name: String!
    lastName : String!
    email : String!
    password : String!
  }
  input AuthInput {
    email : String!
    password : String!
  }
  input ProductInput {
      name: String!
      stock :Int!
      price : Float!
  }

  input ClientInput {
    name: String!
    lastName : String!
    company : String!
    email : String!
    tel :String
  }
  input  OrderProductInput {
      id: ID
      quantity:Int
  }
  enum OrderState {
    PENDING
    COMPLETED
    CANCELED
  }

  input OrderInput {
    orderProducts :[OrderProductInput]
    total : Float
    client : ID
    state : OrderState
  }

  type Query {
    # Usres
    getUser : User

    # products
    getProducts :[Product]
    getProductById(id: ID!) : Product

    #clients
    getClients : [Client]
    getClientsOfSalesMan : [Client]
    getClient(id:ID!) : Client

    #orders
    getOrders : [Order]
    getOrderOFSalsman : [Order]
    getOrder(id:ID!) : Order
    getOrdersByState(state:OrderState) :[Order]

    #Advanced Query
    getBestClients : [TopClient]
    getBestSalesmen : [TopSalesman]
    serachProduct(text :String!) : [Product]

  }
##################################################
  type Mutation {
    #Users
    newUser(input : UserInput!) :User
    authentification(input : AuthInput!) : Token
    #Products
    newProduct(input : ProductInput) : Product
    updateProduct(id:ID!, input:ProductInput) : Product
    removeProduct(id:ID!) :String
    #Clientes
    newClient(input : ClientInput!) : Client
    updateClient(id:ID!, input: ClientInput!) : Client
    removeclient (id:ID!) : String
    #Orders
    newOrder(input: OrderInput!):Order
    updateOrder(id:ID!, input:OrderInput!) : Order
    removeOrder(id:ID!) : String
    }
`;
module.exports = typeDefs;
