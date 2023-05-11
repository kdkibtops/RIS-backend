import client from '../database';
import * as sqlQueries from '../helpers/createSQLString';
import { QueryObject, REQBODY } from '../config/types';
import { getDateInEgypt } from '../config/getDate';
import {
	FailedStatus,
	LocalAConfig,
	SuccessStatus,
} from '../config/LocalConfiguration';

export type Patient = {
	mrn: string;
	patient_name: string;
	national_id: string;
	dob: string;
	age: string;
	gender: string;
	email: string;
	contacts: string;
	registered_by: string;
	registered_date: string;
};

class PATIENT {
	public mrn: string;
	public patient_name: string;
	public national_id: string;
	public dob: string;
	public age: string;
	public gender: string;
	public contacts: string;
	public email: string;
	public registered_by: string;

	constructor(data: Patient) {
		this.mrn = data.mrn;
		this.patient_name = data.patient_name;
		this.national_id = data.national_id;
		this.dob = data.dob;
		this.gender = data.gender;
		this.contacts = data.contacts;
		this.age = data.age;
		this.email = data.email;
		this.registered_by = data.registered_by;
	}
}

/** Inserts a new patient to the database */
export async function insertPatient(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalPatient = reqBody.patients;
		const patient = new PATIENT(originalPatient);
		const columnNames = Object.keys(patient);
		const values = Object.values(patient);
		columnNames.push('registered_date');
		values.push(getDateInEgypt());
		const SQL = sqlQueries.createSQLinsert(
			`main.patients`,
			columnNames,
			values
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

/** Gets one patient in the database by mrn*/
export async function searchPatients(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalPatient = reqBody.patients;
		const patient = new PATIENT(originalPatient);
		const mrn = patient?.mrn || 'null';
		const SQL = sqlQueries.createSQLshowOneOnly(
			'main.patients',
			'mrn',
			mrn,
			[],
			'mrn'
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

/** Updates existing patient in the database */
export async function updatePatient(
	reqBody: REQBODY,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const originalPatient = reqBody.patients;
		const patient = new PATIENT(originalPatient);
		const columnNames = Object.keys(patient);
		const values = Object.values(patient);

		const SQL = sqlQueries.createSQLupdate(
			`main.patients`,
			columnNames,
			values,
			'mrn',
			patient.mrn
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
/** Returns all patients in the database*/
export async function showAllPatients(callBackErr?: Function): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLshowAll('main.patients', []);
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

/** Deletes existing patient from the database */
export async function deletePatient(
	patient: Patient,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
	  }
	| {
			feedback: FailedStatus;
			enteries: 0;
			data: Error;
	  }
> {
	try {
		const SQL = sqlQueries.createSQLdelete(`main.patients`, 'mrn', patient.mrn);
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

/** Searches patients in the database on filters LIKE % no exact match */
export async function searcFilterhPatients(
	query: QueryObject,
	callBackErr?: Function
): Promise<
	| {
			feedback: SuccessStatus;
			enteries: number;
			data: Patient[] | unknown[];
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
