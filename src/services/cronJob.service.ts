import { Injectable } from '@nestjs/common';
import { Cron, Timeout } from '@nestjs/schedule';
import * as fsExtra from 'fs-extra';
import { join } from 'path';
import { CronExpression } from '@nestjs/schedule/dist/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from 'src/models/product.model';
import { ProductInventory } from 'src/models/productInventory.model';
import { Warehouse } from 'src/models/warehouse.model';

@Injectable()
export class CronJobService {
	constructor(
		@InjectModel(Product)
		private readonly ProductModel: typeof Product,
		@InjectModel(ProductInventory)
		private readonly ProductInventoryModel: typeof ProductInventory,
		@InjectModel(Warehouse)
		private readonly WarehouseModel: typeof Warehouse
	) {}

	/**
	 * Clear logs file every 15 days starting on 1st of the month
	 */
	@Cron(CronExpression.EVERY_DAY_AT_3AM)
	async clearLogsEvery2Weeks() {
		const logsDir = join(process.cwd(), 'logs');
		const listFiles = await fsExtra.readdir(logsDir);
		await Promise.all(
			listFiles.map((fileName) => {
				const filePath = join(logsDir, fileName);
				fsExtra.writeFileSync(filePath, '', 'utf8');
			})
		);
	}

	@Cron(CronExpression.EVERY_2_HOURS)
	async cronSyncInventory() {
		this.syncInventory();
	}

	async syncInventory() {
		// Mapping số lượng tồn sp trong quản lý sản phẩm
		const products = await this.ProductModel.findAll();

		for (let product of products) {
			let countInventory = 0;
			let productInventories = await this.ProductInventoryModel.findAll({ where: { product_id: product.id } });

			for (let productInventory of productInventories) {
				countInventory += productInventory.qty;
			}

			await this.ProductModel.update({ virtual_stock_quantity: countInventory }, { where: { id: product.id } });
		}

		// Mapping số lượng tồn kho trong quản lý kho
		const warehouses = await this.WarehouseModel.findAll();

		for (let warehouse of warehouses) {
			let countInventory = 0;
			let productInventories = await this.ProductInventoryModel.findAll({
				where: { warehouse_id: warehouse.id }
			});

			for (let productInventory of productInventories) {
				countInventory += productInventory.qty;
			}

			await this.WarehouseModel.update({ qty_in_stock: countInventory }, { where: { id: warehouse.id } });
		}
	}

	//================== Dynamic Cron Demo ==================
	// @Cron('* * 8 * * *', { name: 'notificatiosn' })
	// triggerNotifications() {}

	// @Timeout(Date.now().toString(), 500)
	// async ____() {
	// 	const seconds = 3;

	// 	const job = new CronJob(`*/${seconds} * * * * *`, () => {
	// 		console.log(`time ${seconds} for job to run!`);
	// 	});

	// 	this.schedulerRegistry.addCronJob('noti', job);
	// 	job.start();

	// 	const interval = setInterval(() => {
	// 		console.log(`Interval running every 10s`, )
	// 	}, 10000)
	// 	this.schedulerRegistry.addInterval("notification-interval", interval)
	// }

	// @Timeout(Date.now.toString(), 30000)
	// async _____() {

	// 	this.schedulerRegistry.deleteCronJob("noti")
	// 	this.schedulerRegistry.deleteInterval("notification-interval")
	// }

	// @Timeout(Date.now.toString(), 60000)
	// async _______(){
		
	// }
}
