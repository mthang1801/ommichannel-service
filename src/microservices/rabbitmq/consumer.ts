// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';

// export const consumer = async () => {
// 	try {
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		const channel = await conn.createChannel();
// 		const queueName = 'publishQueue2';
// 		await channel.assertQueue(queueName, { durable: true });

// 		await channel.consume(
// 			queueName,
// 			(msg) => {
// 				console.log('[x] Receive Message: ', msg.content.toString());
// 			},
// 			{ noAck: true }
// 		);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// consumer();
