// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';

// const subcribeVideo = async () => {
// 	try {
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		const channel = await conn.createChannel();
// 		const exchangeName = 'video';
// 		await channel.assertExchange(exchangeName, 'fanout', { durable: false });
// 		const { queue } = await channel.assertQueue('', { exclusive: true });
// 		console.log(`Queue Name : ${queue}`);
// 		await channel.bindQueue(queue, exchangeName, '');
// 		channel.consume(
// 			queue,
// 			(msg) => {
// 				console.log(`Receive a message: ${msg.content.toString()}`);
// 			},
// 			{ noAck: false }
// 		);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// subcribeVideo();
