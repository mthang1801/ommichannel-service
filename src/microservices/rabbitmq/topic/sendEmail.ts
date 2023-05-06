// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';

// export const sendEmail = async () => {
// 	try {
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		const channel = await conn.createChannel();
// 		const exchangeName = 'send_email';
// 		await channel.assertExchange(exchangeName, 'topic', { durable: false });
// 		const msg = process.argv.at(2);
// 		const topic = process.argv.at(3);

// 		console.log(`msg::${msg}:::topic:::${topic}`);
// 		await channel.publish(exchangeName, topic, Buffer.from(msg));

// 		setTimeout(() => {
// 			channel.close();
// 			process.exit();
// 		}, 5000);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// sendEmail();
