import { Pool } from 'pg';
import { setupData } from './config/config';
import dotenv from 'dotenv';
dotenv.config();

const client =
	String(process.env.ENV) === 'Dev'
		? new Pool({
				host: setupData.host,
				database: setupData.database,
				user: setupData.DB_username,
				password: setupData.DB_password,
				port: setupData.DB_port,
		  })
		: new Pool({
				host: setupData.host,
				database: setupData.database,
				user: setupData.DB_username,
				password: setupData.DB_password,
				port: setupData.DB_port,
		  });

export const testDBConncetion = async (): Promise<
	| {
			status: 'Connected';
			returnVal: {};
	  }
	| {
			status: 'Failed';
			returnVal: {
				connection: unknown;
				databaseName: string;
				enviroment: string;
			};
	  }
	| { status: 'Error'; retunVal: Error }
> => {
	try {
		const connected = await client.connect();
		if (connected) {
			const sql = 'SELECT NOW ();';
			const response = await connected.query(sql);
			connected.release();
			const result = response.rows[0].now;
			String(process.env.ENV) === 'Production' &&
				console.log(
					`Production Enviroment\nConnection to database: "${setupData.database}" is successful\nConnected at: ${result}`
				);
			String(process.env.ENV) === 'Dev' &&
				console.log(
					`Devlopment Enviroment\nConnection to database: "${setupData.database}" is successful\nConnected at: ${result}`
				);
			String(process.env.ENV) !== 'Production' &&
				String(process.env.ENV) !== 'Dev' &&
				console.log(
					`${process.env.ENV} Enviroment\nConnection to database: "${setupData.database}" is successful\nConnected at: ${result}`
				);
			return { status: 'Connected', returnVal: result };
		} else {
			console.log(`Connection to database: "${setupData.database}"  failed`);
			return {
				status: 'Failed',
				returnVal: {
					connection: connected,
					databaseName: setupData.database as string,
					enviroment: process.env.ENV as string,
				},
			};
		}
	} catch (error) {
		console.log(`Connection to database: "${setupData.database}"  failed`); // return 'Failed'
		return { status: 'Error', retunVal: error as Error };
	}
};

export default client;
