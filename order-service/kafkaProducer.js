const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  console.log('Kafka Producer connecté');
}

async function sendOrderCreatedEvent(order) {
  await producer.send({
    topic: 'order-created',
    messages: [
      {
        value: JSON.stringify({
          event: 'ORDER_CREATED',
          data: order,
          createdAt: new Date().toISOString()
        })
      }
    ]
  });

  console.log('Événement ORDER_CREATED envoyé à Kafka');
}

module.exports = {
  connectProducer,
  sendOrderCreatedEvent
};