import { existsSync, mkdirSync, appendFile } from 'fs';
import path from 'path';
import { Response } from 'express';
import { getDateInEgypt } from '../config/getDate';
import { REQBODY } from '../config/types';

const autLogFolder = `E:/My_projects/RadAssist/Backend/Logs/Auth`;
const authLogFile = path.join(
	autLogFolder,
	`${getDateInEgypt().split('T')[0]}.txt`
);

/**
 * @description Returns successful response for Auth request with status code OK (200),
 * Authorization is successful and user can proceed, nothing is created  on the server
 * @emits authenticated
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent including refresh JWT as accessToken
 * @returns {void}
 */
export const sendAuthorzationSuccess = (
	res: Response,
	accessToken: string,
	data: {}
) => {
	try {
		if (!existsSync(autLogFolder)) {
			mkdirSync(autLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const authEventToLog = `
*******************************************Start Of Auth OK*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful => Responded with status code: (200) - OK, Authenticated & Authorized
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
@  ${getDateInEgypt()}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Auth OK*******************************************

	`;
		appendFile(authLogFile, authEventToLog, 'utf8', (err) => {
			if (err) console.log(`AuthResponse, Append to file failed: ${err}`);
		});
		res
			.status(200)
			.json({ authenticated: true, accessToken: accessToken, data });
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in Auth logging: ${err}`);
	}
};

/**
 * @description Returns failed authentication response for Auth request with status code (401) unAuthorized,
 * Authentication failed due to bad authentication data (wrong credentials)
 * @emits unAuthenticated
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent including message to identify why authentication failed
 * @returns {void}
 */
export const sendUnAuthenticated = (
	res: Response,
	data: Object,
	err: Error
) => {
	try {
		if (!existsSync(autLogFolder)) {
			mkdirSync(autLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;
		const errorName = err.name;
		const errorMsg = err.message;
		const errorStack = err.stack;
		const authEventToLog = `
*******************************************Start Of Auth Failed*******************************************
*******************************@${getDateInEgypt()}*******************************

UnAuthenticated => Responded with status code: (401) - unauthorized, Authetnication failed
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
@  ${getDateInEgypt()}
Error Name: ${errorName} 
Message: ${errorMsg}
Stack: ${errorStack}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Auth Failed*******************************************

	`;
		appendFile(authLogFile, authEventToLog, 'utf8', (err) => {
			if (err) console.log(`AuthResponse, Append to file failed: ${err}`);
		});
		res.status(401).json({ ...data, unAuthenticated: true });
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in Auth logging: ${err}`);
	}
};

/**
 * @description Returns failed authentication response for Auth request with status code (401) Forbidden,
 * Authorization failed due to unauthorized user access (user role is not authorized)
 * @emits unAuthorized
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent including message to identify why authorization failed
 * @returns {void}
 */
export const sendUnAuthorized = (res: Response, data: Object, err: Error) => {
	try {
		if (!existsSync(autLogFolder)) {
			mkdirSync(autLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;
		const errorName = err.name;
		const errorMsg = err.message;
		const errorStack = err.stack;
		const authEventToLog = `
*******************************************Start Of Auth Failed*******************************************
*******************************@${getDateInEgypt()}*******************************

UnAuthorized => Responded with status code: (403) - Forbidden, Authentication OK, but not authroized
Request origin: ${res.req.hostname}${res.req.baseUrl}${res.req.url}
Request: ${
			reqBody.users
				? JSON.stringify({
						...reqBody,
						users: { ...reqBody.users, user_password: '****' },
				  })
				: JSON.stringify(res.req.body)
		}
@  ${getDateInEgypt()}
Error Name: ${errorName} 
Message: ${errorMsg}
Stack: ${errorStack}
Data retrieved: ${JSON.stringify(data)}
*******************************************End Of Auth Failed*******************************************

	`;
		appendFile(authLogFile, authEventToLog, 'utf8', (err) => {
			if (err)
				return console.log(`AuthResponse, Append to file failed: ${err}`);
		});
		res.status(403).json({ ...data, unAuthorized: true });
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in Auth logging: ${err}`);
	}
};
