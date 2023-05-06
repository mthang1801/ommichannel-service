// import * as amqplib from 'amqplib';
// import { amqpConfig } from 'src/configs/configs';


// export const receiveEmail = async () => {
// 	try {
// 		const conn = await amqplib.connect(amqpConfig.rabbitUri);
// 		const channel = await conn.createChannel();
// 		const exchangeName = 'send_email';
// 		await channel.assertExchange(exchangeName, 'topic', { durable: false });
// 		const { queue } = await channel.assertQueue('', { exclusive: true });
// 		const args = process.argv.slice(2);
// 		if (!args.length) {
// 			process.exit(1);
// 		}
// 		console.log(`queue:::${queue}`);
// 		for (const key of args) {
// 			await channel.bindQueue(queue, exchangeName, key);
// 		}

// 		await channel.consume(queue, (msg) => {
// 			console.log(`RoutingKey: ${msg.fields.routingKey}:::msg:::${msg.content.toString()}`);
// 		});
// 		console.log(`[x] Receive Msg`);
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

// receiveEmail();
