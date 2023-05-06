// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';

// const postVideo = async ({ msg }) => {
// 	try {
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		const channel = await conn.createChannel();
// 		const exchangeName = 'video';
// 		channel.assertExchange(exchangeName, 'fanout', { durable: false });
// 		await channel.publish(exchangeName, '', Buffer.from(msg));

// 		console.log(`[x] Send message :${msg} complete`);
// 		setTimeout(() => {
// 			channel.close();
// 			process.exit();
// 		}, 5000);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// for (let i = 0; i < 10; i++) {
// 	postVideo({ msg: `This is the message ${i}` });
// }
