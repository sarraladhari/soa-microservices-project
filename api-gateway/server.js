const express = require('express');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const PRODUCT_PROTO_PATH = path.join(__dirname, '../proto/product.proto');

const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(productPackageDefinition).product;

const productClient = new productProto.ProductService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway SOA Microservices fonctionne'
  });
});

app.post('/products', (req, res) => {
  const { name, brand, price, description } = req.body;

  productClient.CreateProduct(
    { name, brand, price, description },
    (err, response) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json(response);
    }
  );
});

app.get('/products', (req, res) => {
  productClient.GetAllProducts({}, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(response);
  });
});

app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  productClient.GetProduct({ id }, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(response);
  });
});

app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, brand, price, description } = req.body;

  productClient.UpdateProduct(
    { id, name, brand, price, description },
    (err, response) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(response);
    }
  );
});

app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  productClient.DeleteProduct({ id }, (err, response) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(response);
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});