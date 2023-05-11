import client from '../database';
import * as sqlQueries from '../helpers/createSQLString';
import { QueryObject, REQBODY } from '../config/types';
import { getDateInEgypt } from '../config/getDate';
import {
	FailedStatus,
	LocalAConfig,
	SuccessStatus,
} from '../config/LocalConfiguration';

export type Order = {
	order_id: string;
	mrn: string;
	study: string;
	o_date: string;
	o_status: string;
	report: string;
	radiologist: string;
	report_status: string;
	last_update: string;
	updated_by: string;
};
class ORDER {
	public order_id: string;
	public mrn: string;
	public study: string;
	public o_date: string;
	public o_status: string;
	public report_status: string;
	public radiologist: string;
	public updated_by: string;

	public constructor(data: Order) {
		this.order_id = data.order_id;
		this.mrn = data.mrn;
		this.study = data.study;
		this.o_date = data.o_date;
		this.o_status = data.o_status;
		this.report_status = data.report_status;
		this.radiologist = data.radiologist;
		this.updated_by = data.updated_by;
	}
}

/** Inserts a new order to the database */
export async function insertOrder(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const OriginalOrder = reqBody.orders;
		const order = new ORDER(OriginalOrder);
		const columnNames = Object.keys(order);
		const values = Object.values(order);
		columnNames.push('last_update');
		values.push(
			new Date().toLocaleString('en-GB', {
				// to get the current time zone of the server
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			})
		);
		const SQL = sqlQueries.createSQLinsert(`main.orders`, columnNames, values);
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}

/** Gets one order in the database by mrn*/
export async function searchOrders(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const OriginalOrder = reqBody.orders;
		const order = new ORDER(OriginalOrder);

		const orderID = order?.order_id || 'null';
		const SQL = sqlQueries.createSQLshowOneOnly(
			'main.orders',
			'order_id',
			orderID,
			[],
			'order_id'
		);
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}

/** Updates existing order in the database */
export async function updateOrder(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const OriginalOrder = reqBody.orders;
		const order = new ORDER(OriginalOrder);
		const columnNames = Object.keys(order);
		const values = Object.values(order);
		columnNames.push('last_update');
		values.push(getDateInEgypt());
		const SQL = sqlQueries.createSQLupdate(
			`main.orders`,
			columnNames,
			values,
			'order_id',
			order.order_id
		);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}

/** Returns all orders in the database*/
export async function showAllOrders(callBackErr?: Function): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		let SQL = sqlQueries.createSQLshowAll('main.orders', []);
		SQL += ` LEFT JOIN main.patients
				ON main.patients.mrn = main.orders.mrn`;
		SQL += ` LEFT JOIN main.studies
				ON main.studies.study_id = main.orders.study`;
		const conn = await client.connect();
		const result = await conn.query(SQL);
		// Just in case that all patients were deleted, the previous query will return nothing
		// So if nothing returned we will cheack for orders regardless of the patients
		if (result.rowCount === 0) {
			const SQL = sqlQueries.createSQLshowAll('main.orders', []);
			const ordersOnly = await conn.query(SQL);
			conn.release();
			return {
				feedback: LocalAConfig.serviceStatus.success,
				enteries: ordersOnly.rowCount,
				data: ordersOnly.rows,
			};
		}
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}

/** Deletes existing order from the database */
export async function deleteOrder(
	order: Order,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLdelete(
			`main.orders`,
			'order_id',
			order.order_id
		);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}

/** Searches orders in the database on filters LIKE % no exact match */
export async function searcFilterhOrders(
	query: QueryObject,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Order[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = `SELECT * from ${query.schema || 'main'}.${
			query.tableName
		} where ${query.filterColumn} LIKE '${query.filterValue.toUpperCase()}%'`;
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: result.rows,
		};
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		} else {
			console.log(`Error: ${error}`);
			return {
				feedback: LocalAConfig.serviceStatus.failed,
				enteries: 0,
				data: error as Error,
			};
		}
	}
}
