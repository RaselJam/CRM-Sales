const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Order = require("../models/Order");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const createToken = (user, secert, expiresIn) => {
  const { id, name, lastName, email } = user;
  return jwt.sign({ id, name, lastName, email }, secert, { expiresIn });
};

//resolvers
const resolvers = {
  Query: {
    getUser: async (_, {}, ctx) => {
      console.log(ctx);
      return ctx.user;
    },
    getProducts: async () => {
      try {
        const products = await Product.find({});
        return products;
      } catch (error) {
        console.log(error);
      }
    },
    getProductById: async (_, { id }) => {
      console.log(id);
      try {
        const product = await Product.findById(id);
        return product;
      } catch (error) {
        console.log(error);
      }
    },
    getClients: async () => {
      try {
        const clients = await Client.find({});
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClientsOfSalesMan: async (_, {}, ctx) => {
      try {
        const clients = await Client.find({ salesMan: ctx.user.id });
        return clients;
      } catch (error) {
        console.log(error);
      }
    },
    getClient: async (_, { id }, ctx) => {
      const client = await Client.findById(id);
      if (!client) throw new Error("Not Found");
      if (client.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");
      return client;
    },

    getOrders: async (_, {}, ctx) => {
      const orders = await Order.find({});
      return orders;
    },
    getOrderOFSalsman: async (_, {}, ctx) => {
      const orders = await Order.find({ salesMan: ctx.user.id });
      return orders;
    },
    getOrder: async (_, { id }, ctx) => {
      const order = await Order.findOne({ _id: id });
      if (order.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");
      return order;
    },
    getOrdersByState: async (_, { state }, ctx) => {
      console.log(state, ctx.user.id);
      const orders = await Order.find({ salesMan: ctx.user.id, state: state });
      return orders;
    },
    getBestClients: async () => {
      const clients = await Order.aggregate([
        { $match: { state: "COMPLETED" } },
        {
          $group: {
            _id: "$client",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client",
          },
        },
        { $limit: 3 },
        {
          $sort: { total: -1 },
        },
      ]);
      clients.forEach((elm) => (elm.client[0].id = elm.client[0]._id));
      return clients;
    },
    getBestSalesmen: async () => {
      const salesMen = await Order.aggregate([
        { $match: { state: "COMPLETED" } },
        {
          $group: {
            _id: "$salesMan",
            total: { $sum: "$total" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "salesMan",
          },
        },
        { $limit: 3 },
        {
          $sort: { total: -1 },
        },
      ]);
      salesMen.forEach((elm) => (elm.salesMan[0].id = elm.salesMan[0]._id));
      return salesMen;
    },
    serachProduct: async (_, { text }) => {
      const product = await Product.find({ $text: { $search: text } }).limit(
        10
      );
      return product;
    },
  },

  Mutation: {
    newUser: async (_, { input }) => {
      const { email, password } = input;
      // check if its already exist:
      const isRegisterd = await User.findOne({ email });
      if (isRegisterd) {
        throw new Error("Already Registerd");
      }
      //Hash pass
      const salt = await bcryptjs.genSalt(5);
      input.password = await bcryptjs.hash(password, salt);
      try {
        // save on DB
        const user = new User(input);
        user.save();
        return user;
      } catch (error) {
        console.log(error);
      }
    },
    authentification: async (_, { input }) => {
      //To see if Exists :
      const { email, password } = input;
      console.log(email, password);
      const targetUser = await User.findOne({ email });
      if (!targetUser) {
        throw new Error("Incorrect Password / UserName");
      }

      //Check the Pass
      const isPassWordCorrect = await bcryptjs.compare(
        password,
        targetUser.password
      );
      if (!isPassWordCorrect) {
        throw new Error("Incorrect Password / UserName");
      }

      //Create Token
      return { token: createToken(targetUser, process.env.SECRET, "24h") };
    },
    //Products :
    newProduct: async (_, { input }) => {
      try {
        const product = new Product(input);
        const result = await product.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateProduct: async (_, { id, input }) => {
      try {
        let product = await Product.findById(id);
        if (!product) {
          throw new Error("Not Found");
        }

        product = await Product.findOneAndUpdate({ _id: id }, input, {
          new: true,
        });
        return product;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    removeProduct: async (_, { id }) => {
      try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) throw new Error("Not Found");
        return "Removed successfully";
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    //Clients
    newClient: async (_, { input }, ctx) => {
      //check if already exist
      const client = await Client.findOne({ email: input.email });

      if (client) throw new Error("Client already exists");
      const newClient = new Client(input);

      //asigne to current SalesMan
      newClient.salesMan = ctx.user.id;

      //save in DB
      try {
        const result = await newClient.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    updateClient: async (_, { id, input }, ctx) => {
      let client = await Client.findById(id);
      if (!client) throw new Error("Not Found");
      if (client.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");

      client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });
      return client;
    },
    removeclient: async (_, { id }, ctx) => {
      let client = await Client.findById(id);
      if (!client) throw new Error("Not Found");
      if (client.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");

      await Client.findOneAndDelete({ _id: id });
      return "Removed successfully";
    },

    //Orders
    newOrder: async (_, { input }, ctx) => {
      const { client } = input;
      //Check if  cliente exists
      let existsingClient = await Client.findById(client);
      if (!existsingClient) throw new Error("Client Not Found");
      //Check if salesman is correct
      if (existsingClient.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");
      //check if there is enough Stock
      for await (const article of input.orderProducts) {
        const { id } = article;
        const product = await Product.findById(id);
        if (article.quantity > product.stock) {
          throw new Error("Not enough Stock");
        } else {
          product.stock = product.stock - article.quantity;
          await product.save();
        }
      }
      const newOrder = new Order(input);
      //asigne the current salesMan
      newOrder.salesMan = ctx.user.id;
      //Save in DB
      const result = await newOrder.save();
      return result;
    },
    updateOrder: async (_, { id, input }, ctx) => {
      const order = await Order.findById(id);
      if (!order) throw new Error("Order not Found");

      if (order.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");
      //check if there is enough Stock
      if (input.state === "CANCELED") {
        for await (const article of order.orderProducts) {
          const { id } = article;
          const product = await Product.findById(id);
          product.stock = product.stock + article.quantity;
          product.save();
        }
      }
      if (input.orderProducts) {
        for await (const article of input.orderProducts) {
          const { id } = article;
          const product = await Product.findById(id);
          if (article.quantity > product.stock) {
            throw new Error("Not enough Stock");
          } else {
            product.stock = product.stock - article.quantity;
            await product.save();
          }
        }
      }

      const result = await Order.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return result;
    },
    removeOrder: async (_, { id }, ctx) => {
      const order = await Order.findById(id);
      if (!order) throw new Error("Order not Found");

      if (order.salesMan.toString() !== ctx.user.id)
        throw new Error("Not Authorized");

      for await (const article of order.orderProducts) {
        const { id } = article;
        const product = await Product.findById(id);
        product.stock = product.stock + article.quantity;
        product.save();
      }
      await Order.findByIdAndDelete(id);
      return "Order Removed Successfully and products returned to stock";
    },
  },
};

module.exports = resolvers;
