import client from '../database';
import {
	createSQLshowOneOnly,
	createSQLupdate,
} from '../helpers/createSQLString';
import { Order } from './Orders';
import { Patient } from './Patients';
import path from 'path';

export const getOrderPatientData = async (
	order_id: string
): Promise<{ patient: Patient | null; order: Order | null }> => {
	try {
		const SQL_order = createSQLshowOneOnly(
			'main.orders',
			'order_id',
			order_id,
			[],
			'order_id'
		);
		const conn = await client.connect();
		const order = (await conn.query(SQL_order)).rows[0];
		const SQL_patient = createSQLshowOneOnly(
			'main.patients',
			'mrn',
			order.mrn,
			[],
			'mrn'
		);
		const patient = (await conn.query(SQL_patient)).rows[0];
		conn.release();
		return { patient: patient, order: order };
	} catch (error) {
		console.log(`${error}`);
		return { patient: null, order: null };
	}
};

export const insertPathToDB = async (
	tableName: string,
	filterColumn: string,
	filterValue: string,
	insertColumn: string,
	filePath: string
): Promise<Order | null> => {
	try {
		const SQL_query = createSQLshowOneOnly(
			tableName,
			filterColumn,
			filterValue,
			[insertColumn],
			filterColumn
		);

		const conn = await client.connect();
		const reports = (await conn.query(SQL_query)).rows[0][insertColumn];
		console.log(reports);
		let SQL_INSERT = `UPDATE ${tableName} 
        SET ${insertColumn} 
        = (ARRAY [`;
		// this will run only if there's reports saved to avoid iterating over null if no reports
		if (reports) {
			reports.forEach((element: string) => {
				SQL_INSERT += `'${element}',`;
			});
		}
		SQL_INSERT += `'${filePath}'] )
        WHERE ${filterColumn}='${filterValue}'`;

		const result = (await conn.query(SQL_INSERT)).rows[0];
		conn.release();
		return result;
	} catch (error) {
		console.log(`${error}`);
		return null;
	}
};

export const deletePathFromDB = async (
	tableName: string,
	filterColumn: string,
	filterValue: string,
	insertColumn: string,
	filePath: string
): Promise<Order | null> => {
	try {
		const SQL_query = createSQLshowOneOnly(
			tableName,
			filterColumn,
			filterValue,
			[insertColumn],
			filterColumn
		);
		console.log(SQL_query);
		const conn = await client.connect();
		const reports = (await conn.query(SQL_query)).rows[0][insertColumn];
		const pathToDelete = reports.find((p: string) => p === filePath);
		// console.log('delete', path.join(pathToDelete));
		reports.forEach((element: string) => {
			console.log(pathToDelete !== element);
		});
		const filteredArray = reports.filter((e: string) => e !== pathToDelete);
		// console.log(filteredArray);
		let SQL_INSERT = `UPDATE ${tableName} 
		SET ${insertColumn} `;
		// this will run only if there's reports saved to avoid iterating over null if no reports
		if (filteredArray.length > 0) {
			SQL_INSERT += `= (ARRAY [`;
			filteredArray.forEach((element: string) => {
				SQL_INSERT += `'${element}',`;
			});
			SQL_INSERT = SQL_INSERT.slice(0, -1);
			SQL_INSERT += `] )
			WHERE ${filterColumn}='${filterValue}' RETURNING *`;
		} else if (filteredArray.length < 1 || !filteredArray) {
			SQL_INSERT = `UPDATE ${tableName} SET ${insertColumn}=NULL WHERE ${filterColumn}='${filterValue}' RETURNING *`;
		}
		console.log(SQL_INSERT);
		const result = (await conn.query(SQL_INSERT)).rows[0];
		conn.release();
		return result;
	} catch (error) {
		console.log(`${error}`);
		return null;
	}
};
