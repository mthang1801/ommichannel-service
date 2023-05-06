import { Sequelize } from 'sequelize';
import { appConfig, dbConfig } from './configs';

export const sequelize = new Sequelize(dbConfig.master.database, null, null, {
	timezone: '+07:00',
	dialect: 'mysql',
	logging: false,
	pool: {
		max: 20,
		min: 2,
		acquire: 30000,
		idle: 10000
	},
	replication: {
		write: {
			host: dbConfig.master.host,
			username: dbConfig.master.username,
			database: dbConfig.master.database,
			password: dbConfig.master.password,
			port: dbConfig.master.port
		},
		read: [
			{
				host: dbConfig.slave.host,
				username: dbConfig.slave.username,
				database: dbConfig.slave.database,
				password: dbConfig.slave.password,
				port: dbConfig.slave.port
			}
		]
	}
});

export const ListeningConnectedDatabase = async (app) => {
	const PORT = appConfig.port;
	sequelize
		.authenticate()
		.then(async () => {
			await app.listen(PORT, async () => {
				console.log(`Application is running on: ${await app.getUrl()}`);
				console.table({
					Master: {
						host: dbConfig.master.host,
						database: dbConfig.master.database
					},
					Slave: {
						host: dbConfig.slave.host,
						database: dbConfig.slave.database
					}
				});
			});
		})
		.catch((err) => console.log(err));
};
