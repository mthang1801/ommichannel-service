class PageAbstract {
	currentPage: number;
	pageSize: number;
	total: number;
}

export class ResponseAbstractList<T> {
	data: T[];
	paging?: PageAbstract;
}
