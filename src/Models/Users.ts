import {
	FailedStatus,
	LocalAConfig,
	SuccessStatus,
} from './../config/LocalConfiguration';
import client from '../database';
import * as sqlQueries from '../helpers/createSQLString';
import { QueryObject, REQBODY } from '../config/types';
import { getDateInEgypt } from '../config/getDate';

export type User = {
	user_id?: number | string;
	username: string;
	full_name?: string;
	user_password?: string;
	user_role?: string;
	job?: string;
	email?: string;
};
class USER {
	public user_id: number | string;
	public username: string;
	public full_name: string;
	public user_password: string;
	public user_role: string;
	public job: string;
	public email: string;

	public constructor(data: User) {
		this.user_id = data.user_id || '';
		this.username = data.username || '';
		this.full_name = data.full_name || '';
		this.user_password = data.user_password || '';
		this.user_role = data.user_role || '';
		this.job = data.job || '';
		this.email = data.email || '';
	}
}
/**Inserts a new user to the database*/
export async function insertUser(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalUser = reqBody.users;
		const user = new USER(originalUser);
		const columnNames = Object.keys(user);
		const values = Object.values(user);
		columnNames.push('created');
		values.push(getDateInEgypt());
		const SQL = sqlQueries.createSQLinsert(`main.users`, columnNames, values);
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		const createduser = result.rows[0] as User;
		delete createduser.user_password;
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: [createduser],
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
/**Gets one user in the database by username*/
export async function searchUsers(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalUser = reqBody.users;
		const user = new USER(originalUser);
		let SQL = '';
		const conn = await client.connect();
		let rowCount: number;
		let rows: unknown[];
		if (user.user_id) {
			console.log(user.user_id);
			const user_id = user?.user_id || 'null';
			SQL = sqlQueries.createSQLshowOneOnly(
				'main.users',
				'user_id',
				user_id,
				[],
				'user_id'
			);
			const result = await conn.query(SQL);
			rowCount = result.rowCount;
			rows = result.rows;
		} else if (user.username) {
			const username = user?.username || 'null';
			SQL = sqlQueries.createSQLshowOneOnly(
				'main.users',
				'username',
				username,
				[],
				'username'
			);
			const result = await conn.query(SQL);
			rowCount = result.rowCount;
			rows = result.rows;
		} else {
			rowCount = 0;
			rows = [];
			console.log(`nothing found`);
		}

		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: rowCount,
			data: rows,
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
/**Updates existing user in the database*/
export async function updateUser(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalUser = reqBody.users;
		const user = new USER(originalUser);
		const columnNames = Object.keys(user);
		const values = Object.values(user);

		const SQL = sqlQueries.createSQLupdate(
			`main.users`,
			columnNames,
			values,
			'user_id',
			user.user_id as string
		);
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		const updateduser = result.rows[0] as User;
		delete updateduser.user_password;
		conn.release();
		return {
			feedback: LocalAConfig.serviceStatus.success,
			enteries: result.rowCount,
			data: [updateduser],
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

/**Returns all users in the database*/
export async function showAllUsers(callBackErr?: Function): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLshowAll('main.users', [
			'user_id',
			'username',
			'user_role',
			'job',
			'email',
			'full_name',
		]);

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

/**Deletes existing user from the database*/
export async function deleteUser(
	user: User,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		let SQL = '';
		if (user.user_id) {
			const user_id = user?.user_id || 'null';
			SQL = sqlQueries.createSQLdelete(
				'main.users',
				'user_id',
				user_id as string
			);
		} else if (user.username) {
			const username = user?.username || 'null';
			SQL = sqlQueries.createSQLdelete('main.users', 'username', username);
		}
		console.log(SQL);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		result.rows.forEach((e) => delete e.user_password);
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

/**Searches users in the database on filters LIKE % no exact match*/
export async function searcFilterhUsers(
	query: QueryObject,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: User[] | unknown[];
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
		} where ${query.filterColumn} LIKE '${query.filterValue}%'`;
		console.log(SQL);
		// console.log(12);
		const conn = await client.connect();
		const result = await conn.query(SQL);
		conn.release();
		result.rows.forEach((e) => delete e.user_password);
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
