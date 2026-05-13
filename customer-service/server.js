const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const db = require('./database');

const PROTO_PATH = path.join(__dirname, '../proto/customer.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

function createCustomer(call, callback) {
  const { name, email, phone } = call.request;

  db.run(
    `INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`,
    [name, email, phone],
    function (err) {
      if (err) {
        return callback(err);
      }

      const customer = {
        id: this.lastID,
        name,
        email,
        phone
      };

      callback(null, {
        customer,
        message: 'Client créé avec succès'
      });
    }
  );
}

function getCustomer(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM customers WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback(err);
    }

    if (!row) {
      return callback(null, {
        customer: null,
        message: 'Client non trouvé'
      });
    }

    callback(null, {
      customer: row,
      message: 'Client trouvé'
    });
  });
}

function getAllCustomers(call, callback) {
  db.all(`SELECT * FROM customers`, [], (err, rows) => {
    if (err) {
      return callback(err);
    }

    callback(null, {
      customers: rows
    });
  });
}

const server = new grpc.Server();

server.addService(customerProto.CustomerService.service, {
  CreateCustomer: createCustomer,
  GetCustomer: getCustomer,
  GetAllCustomers: getAllCustomers
});

server.bindAsync(
  '0.0.0.0:50052',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Customer Service gRPC démarré sur le port 50052');
  }
);