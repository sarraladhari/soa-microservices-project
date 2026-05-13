const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const db = require('./database');

const PROTO_PATH = path.join(__dirname, '../proto/product.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

function createProduct(call, callback) {
  const { name, brand, price, description } = call.request;

  db.run(
    `INSERT INTO products (name, brand, price, description) VALUES (?, ?, ?, ?)`,
    [name, brand, price, description],
    function (err) {
      if (err) {
        return callback(err);
      }

      const product = {
        id: this.lastID,
        name,
        brand,
        price,
        description
      };

      callback(null, {
        product,
        message: 'Produit créé avec succès'
      });
    }
  );
}

function getProduct(call, callback) {
  const { id } = call.request;

  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return callback(err);
    }

    if (!row) {
      return callback(null, {
        product: null,
        message: 'Produit non trouvé'
      });
    }

    callback(null, {
      product: row,
      message: 'Produit trouvé'
    });
  });
}

function getAllProducts(call, callback) {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) {
      return callback(err);
    }

    callback(null, {
      products: rows
    });
  });
}

function updateProduct(call, callback) {
  const { id, name, brand, price, description } = call.request;

  db.run(
    `UPDATE products SET name = ?, brand = ?, price = ?, description = ? WHERE id = ?`,
    [name, brand, price, description, id],
    function (err) {
      if (err) {
        return callback(err);
      }

      callback(null, {
        product: { id, name, brand, price, description },
        message: 'Produit modifié avec succès'
      });
    }
  );
}

function deleteProduct(call, callback) {
  const { id } = call.request;

  db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
    if (err) {
      return callback(err);
    }

    callback(null, {
      success: true,
      message: 'Produit supprimé avec succès'
    });
  });
}

const server = new grpc.Server();

server.addService(productProto.ProductService.service, {
  CreateProduct: createProduct,
  GetProduct: getProduct,
  GetAllProducts: getAllProducts,
  UpdateProduct: updateProduct,
  DeleteProduct: deleteProduct
});

server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Product Service gRPC démarré sur le port 50051');
    server.start();
  }
);