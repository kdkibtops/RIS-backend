import client from '../database';
import * as sqlQueries from '../helpers/createSQLString';
import { QueryObject, REQBODY } from '../config/types';
import { getDateInEgypt } from '../config/getDate';
import {
	FailedStatus,
	SuccessStatus,
	LocalAConfig,
} from '../config/LocalConfiguration';

export type Study = {
	study_id: string;
	modality: string;
	study_name: string;
	arabic_name: string;
	price: number;
	last_update: string;
	updated_by: string;
};
class STUDY {
	public study_id: number | string;
	public modality: string;
	public study_name: string;
	public arabic_name: string;
	public price: number;
	public updated_by: string;

	public constructor(data: Study) {
		this.study_id = data.study_id || '';
		this.modality = data.modality || '';
		this.study_name = data.study_name || '';
		this.arabic_name = data.arabic_name || '';
		this.price = data.price || 0;
		this.updated_by = data.updated_by || '';
	}
}
export async function insertStudy(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalStudy = reqBody.studies;
		const study = new STUDY(originalStudy);
		const columnNames = Object.keys(study);
		const values = Object.values(study);
		columnNames.push('last_update');
		values.push(getDateInEgypt());
		const SQL = sqlQueries.createSQLinsert(`main.studies`, columnNames, values);
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

export async function searchStudies(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalStudy = reqBody.studies;
		const study = new STUDY(originalStudy);
		const studyID = study?.study_id || 'null';
		const SQL = sqlQueries.createSQLshowOneOnly(
			'main.studies',
			'study_id',
			studyID,
			[],
			'study_id'
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

export async function updateStudy(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalStudy = reqBody.studies;
		const study = new STUDY(originalStudy);
		const columnNames = Object.keys(study);
		const values = Object.values(study);
		columnNames.push('last_update');
		values.push(getDateInEgypt());
		const SQL = sqlQueries.createSQLupdate(
			`main.studies`,
			columnNames,
			values,
			'study_id',
			study.study_id
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

export async function showAllStudies(callBackErr?: Function): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLshowAll('main.studies', []);
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
// Working
//deletes existing study from the database
export async function deleteStudy(
	study: Study,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLdelete(
			`main.studies`,
			'study_id',
			study.study_id
		);
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
// Working
// searches users in the database on filters LIKE % no exact match
export async function searcFilterhStudies(
	query: QueryObject,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Study[] | unknown[];
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

/******************************** */
// Under Debugging
/******************************** */
