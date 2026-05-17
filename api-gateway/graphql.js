const { ApolloServer } = require('@apollo/server');

function createGraphQLServer(productClient, customerClient, orderClient) {

  const typeDefs = `

    type Product {
      id: Int
      name: String
      brand: String
      price: Float
      description: String
    }

    type Customer {
      id: Int
      name: String
      email: String
      phone: String
    }

    type Order {
      id: Int
      customer_id: Int
      product_id: Int
      quantity: Int
      total_price: Float
      status: String
    }

    type Query {
      products: [Product]
      customers: [Customer]
      orders: [Order]
    }

  `;

  const resolvers = {

    Query: {

      products: async () => {
        return new Promise((resolve, reject) => {

          productClient.GetAllProducts({}, (err, response) => {

            if (err) {
              reject(err);
            } else {
              resolve(response.products);
            }

          });

        });
      },

      customers: async () => {
        return new Promise((resolve, reject) => {

          customerClient.GetAllCustomers({}, (err, response) => {

            if (err) {
              reject(err);
            } else {
              resolve(response.customers);
            }

          });

        });
      },

      orders: async () => {
        return new Promise((resolve, reject) => {

          orderClient.GetAllOrders({}, (err, response) => {

            if (err) {
              reject(err);
            } else {
              resolve(response.orders);
            }

          });

        });
      }

    }

  };

  return new ApolloServer({
    typeDefs,
    resolvers
  });

}

module.exports = createGraphQLServer;