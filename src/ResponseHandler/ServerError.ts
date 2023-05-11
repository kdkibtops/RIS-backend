import { existsSync, mkdirSync, appendFile } from 'fs';
import path from 'path';
import { Response } from 'express';
import { getDateInEgypt } from '../config/getDate';
import { REQBODY } from '../config/types';

const errorLogFolder = `E:/My_projects/RadAssist/Backend/Logs/Errors`;
const errorLogFile = path.join(
	errorLogFolder,
	`${getDateInEgypt().split('T')[0]}.txt`
);

/**
 * @description Returns failed response due to server error with status code (500), if the request failed due to
 * server side error, but the resquest from client was well constructed and valid
 * No descriptive data sent to the client, the error is just logged at the server side
 * @param {Response} res: The response to be sent
 * @param {Object} data: if you need to send further details to the client, should not be descriptive details, should includes refresh JWT as accessToken
 * @param {Error} err: the error thrown by the handler
 * @returns {void}
 */
export const sendServerError = (
	res: Response,
	data: { accessToken: string; data: Object; action: string },
	err: Error
) => {
	try {
		if (!existsSync(errorLogFolder)) {
			mkdirSync(errorLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const errorName = err.name;
		const errorMsg = err.message;
		const errorStack = err.stack;
		const errorToLog = `
*******************************************Start Of Error*******************************************
*******************************@${getDateInEgypt()}*******************************

Server Error => Responded with status code: (500) Internal server error
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
Name: ${errorName} @  ${getDateInEgypt()}
Message: ${errorMsg}
Stack: ${errorStack}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Error*******************************************

		`;
		appendFile(errorLogFile, errorToLog, 'utf8', (err) => {
			if (err) console.log(`Server Error, Append to file failed: ${err}`);
		});
		res.status(500).json({
			action: 'Internal Server error',
			data: ['Server error'],
			accessToken: data.accessToken,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in error logging: ${err}`);
	}
};
/**
 * @description Returns failed response due to service unavailable error with status code (503), if the request failed due to
 * unavailabe service (database not ready or other applications), but ther server is working properly and the resquest from
 * client was well constructed and valid
 * No descriptive data sent to the client, the error is just logged at the server side
 * @param {Response} res: The response to be sent
 * @param {Object} data: if you need to send further details to the client, should not be descriptive details, should includes refresh JWT as accessToken
 * @param {Error} err: the error thrown by the handler
 * @returns {void}
 */
export const sendServiceUnavailableError = (
	res: Response,
	data: { accessToken: string; data: Object; action: string },
	err: Error
) => {
	try {
		if (!existsSync(errorLogFolder)) {
			mkdirSync(errorLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const errorName = err.name;
		const errorMsg = err.message;
		const errorStack = err.stack;
		const errorToLog = `
*******************************************Start Of Error*******************************************
*******************************@${getDateInEgypt()}*******************************

Server Error => Responded with status code: (503) - service not available
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
Name: ${errorName} @  ${getDateInEgypt()}
Message: ${errorMsg}
Stack: ${errorStack}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Error*******************************************

		`;
		appendFile(errorLogFile, errorToLog, 'utf8', (err) => {
			if (err) console.log(`Server Error, Append to file failed: ${err}`);
		});
		res.status(503).json({
			action: 'Service not available',
			data: ['Server error', 'Service not available'],
			accessToken: data.accessToken,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in error logging: ${err}`);
	}
};
