const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const db = require('./database');

const PROTO_PATH = path.join(__dirname, '../proto/order.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).order;

function createOrder(call, callback) {
  const {
    customer_id,
    product_id,
    quantity,
    total_price
  } = call.request;

  const status = 'PENDING';

  db.run(
    `INSERT INTO orders 
    (customer_id, product_id, quantity, total_price, status)
    VALUES (?, ?, ?, ?, ?)`,
    [customer_id, product_id, quantity, total_price, status],
    function (err) {
      if (err) {
        return callback(err);
      }

      const order = {
        id: this.lastID,
        customer_id,
        product_id,
        quantity,
        total_price,
        status
      };

      callback(null, {
        order,
        message: 'Commande créée avec succès'
      });
    }
  );
}

function getOrder(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback(err);
    }

    if (!row) {
      return callback(null, {
        order: null,
        message: 'Commande non trouvée'
      });
    }

    callback(null, {
      order: row,
      message: 'Commande trouvée'
    });
  });
}

function getAllOrders(call, callback) {
  db.all(`SELECT * FROM orders`, [], (err, rows) => {
    if (err) {
      return callback(err);
    }

    callback(null, {
      orders: rows
    });
  });
}

const server = new grpc.Server();

server.addService(orderProto.OrderService.service, {
  CreateOrder: createOrder,
  GetOrder: getOrder,
  GetAllOrders: getAllOrders
});

server.bindAsync(
  '0.0.0.0:50053',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Order Service gRPC démarré sur le port 50053');
  }
);