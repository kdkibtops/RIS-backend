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
 * @description Returns bad request response with status code OK (400), if the request is not well contructed
 * or the there's an error in the request.
 * @emits badRequest in the response
 * @param {Response} res: Express Response to be sent
 * @param {Object} data: the data to be sent including refresh JWT as accessToken
 * @returns {void}
 */

export const sendBadRequestResponse = (
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

Client Error => Responded with status code: (400) - Bad Request
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
			if (err) console.log(`Client Error, Append to file failed: ${err}`);
		});
		res.status(400).json({
			...data,
			action: 'Bad Request',
			badRequest: true,
			accessToken: data.accessToken,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in error logging: ${err}`);
	}
};

/**
 * @description Returns not found response with status code OK (404), if the request well contructed but the requested resource is not found
 * @emits notFound in the response
 * @param {Response} res: Express Response to be sent
 * @param {Object} data: the data to be sent including refresh JWT as accessToken
 * @returns {void}
 */

export const sendNotFoundResponse = (
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

Client Error => Responded with status code: (404) - Requested Resource Not Found 
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Name: ${errorName} @  ${getDateInEgypt()}
Message: ${errorMsg}
Stack: ${errorStack}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Error*******************************************

		`;
		appendFile(errorLogFile, errorToLog, 'utf8', (err) => {
			if (err) console.log(`Client Error, Append to file failed: ${err}`);
		});
		res.status(404).json({
			...data,
			action: 'Resource Not Found',
			notFound: true,
			accessToken: data.accessToken,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in error logging: ${err}`);
	}
};
