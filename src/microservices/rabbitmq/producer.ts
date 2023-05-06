// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';


// const sendQueue = async ({ msg }) => {
// 	try {
// 		// 1.Create connect
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		// 2.Create channel
// 		const channel = await conn.createChannel();
// 		// 3.Create Queue
// 		const queueName = 'publishQueue2';
// 		await channel.assertQueue(queueName, { durable: true });
// 		await channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
// 		channel.prefetch(1);
// 		console.log(`[x]: Send ${msg} to Queue Success`);
// 		setTimeout(() => {
// 			conn.close();
// 			process.exit();
// 		}, 5000);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// for (let i = 0; i < 10; i++) {
// 	sendQueue({ msg: 'Hello WOrld' + i });
// }
