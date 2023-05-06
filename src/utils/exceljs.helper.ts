import { join, resolve } from 'path';
export const excelDir = resolve('templates', 'excels');
export const excelExportBySellerIdDir = resolve('templates', 'excels', 'exports');
export const excelImportBySellerIdDir = resolve('templates', 'excels', 'imports');

export const excelExportFilePath = (sellerId: number, fileName: string) =>
	join(excelExportBySellerIdDir, String(sellerId), fileName);

export const excelImportFilePath = (sellerId: number, fileName: string) =>
	join(excelImportBySellerIdDir, String(sellerId), fileName);

export const getIdByDynamicDataList = (selectedData: string) =>
	selectedData
		? selectedData
				.split('-')[0]
				.replace(/(\[|\])/g, '')
				.trim()
		: null;

export const genValuesSerialNo = (ws, column) => {
	const values = ['SerialNo'];
	values.push(...(Array.from(Array(100).keys()) as any));
	ws.getColumn(column).values = values;
	ws.getColumn(column).hidden = true;
};

export const initSetupWorkbook = (wb) => {
	wb.calcProperties.fullCalcOnLoad = true;

	wb.views = [
		{
			x: 0,
			y: 0,
			width: 768,
			height: 768,
			firstSheet: 0,
			activeTab: 1,
			visibility: 'visible',
			wrapText: true
		}
	];
};
