export interface IFlatMenu {
	ui_route: string;
	status: boolean;
	level: number;
	ui_icon: string;
	active_icon: string;
	funct_name: string;
	funct_code: string;
	action: string;
	mobile_route: string;
	mobile_icon: string;
}

export interface IFunctField extends IFlatMenu {
	api_route: string;
	method: string;
}

export interface IApiMenu {
	api_route: string;
	method: string;
}
