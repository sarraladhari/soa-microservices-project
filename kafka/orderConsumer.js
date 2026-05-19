const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-consumer',
  brokers: ['127.0.0.1:9092']
});

const consumer = kafka.consumer({
  groupId: 'order-consumer-group'
});

async function startConsumer() {
  try {
    await consumer.connect();
    console.log('Kafka Consumer connecté');

    await consumer.subscribe({
      topic: 'order-created',
      fromBeginning: true
    });

    console.log('Consumer en écoute sur le topic order-created');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const value = message.value.toString();
        const event = JSON.parse(value);

        console.log('-----------------------------');
        console.log('Nouvel événement Kafka reçu');
        console.log('Topic :', topic);
        console.log('Partition :', partition);
        console.log('Event :', event.event);
        console.log('Commande :', event.data);
        console.log('Date :', event.createdAt);
        console.log('-----------------------------');
      }
    });

  } catch (error) {
    console.error('Erreur Kafka Consumer :', error.message);
  }
}

startConsumer();