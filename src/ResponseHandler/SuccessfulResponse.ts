import { existsSync, mkdirSync, appendFile } from 'fs';
import path from 'path';
import { Response } from 'express';
import { getDateInEgypt } from '../config/getDate';
import { REQBODY } from '../config/types';
import { LocalAConfig } from '../config/LocalConfiguration';

const eventsLogFolder = `E:/My_projects/RadAssist/Backend/Logs/Events`;
const eventsLogFile = path.join(
	eventsLogFolder,
	`${getDateInEgypt().split('T')[0]}.txt`
);

/**
 * @description Returns successful response with status code OK (200), if the request is just successful
 * and created nothing on the server, to be used with requests that doesn't create new entry.
 * @emits successful in the response
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent
 * @returns {void}
 */
export const sendSuccessfulResponse = (
	res: Response,
	accessToken: string,
	data: Object
) => {
	try {
		if (!existsSync(eventsLogFolder)) {
			mkdirSync(eventsLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;
		const eventToLog = `
*******************************************Start Of Event*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful => Responded with status code: (200) - OK, No content changed
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
Data retrieved: Successful 
*******************************************End Of Event*******************************************

		`;
		appendFile(eventsLogFile, eventToLog, 'utf8', (err) => {
			if (err) console.log(`SuccessfulResponse, Append to file failed: ${err}`);
		});
		res.status(200).json({
			...data,
			accessToken: accessToken,
			action: data['action' as keyof typeof data]
				? data['action' as keyof typeof data]
				: LocalAConfig.serviceAction.success,
			successful: true,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in event logging: ${err}`);
	}
};

/**
 * @description Returns successful response with status code (200), to be used with successful contents that
 * updated contents on the server but didn't create new content
 * @emits updated in the response
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent
 * @returns {void}
 */
export const sendAcceptedUpdatedResponse = (
	res: Response,
	accessToken: string,
	data: Object
) => {
	try {
		if (!existsSync(eventsLogFolder)) {
			mkdirSync(eventsLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const eventToLog = `
*******************************************Start Of Event*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful => Responded with status code: (200) - OK , Content Updated
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
Data retrieved: Successful 
*******************************************End Of Event*******************************************

	`;
		appendFile(eventsLogFile, eventToLog, 'utf8', (err) => {
			if (err) console.log(`SuccessfulResponse, Append to file failed: ${err}`);
		});
		res.status(200).json({
			...data,
			accessToken: accessToken,
			action: data['action' as keyof typeof data]
				? data['action' as keyof typeof data]
				: LocalAConfig.serviceAction.updated,
			updated: true,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in event logging: ${err}`);
	}
};

/**
 * @description Returns successful response with status code (201), if the request is successful
 * and created new content on the server.
 * @emits created in the response
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent
 * @returns {void}
 */
export const sendAcceptedCreatedResponse = (
	res: Response,
	accessToken: string,
	data: Object
) => {
	try {
		if (!existsSync(eventsLogFolder)) {
			mkdirSync(eventsLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const eventToLog = `
*******************************************Start Of Event*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful => Responded with status code: (201) - Created new content
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
Data retrieved: Successful 
*******************************************End Of Event*******************************************

	`;
		appendFile(eventsLogFile, eventToLog, 'utf8', (err) => {
			if (err) console.log(`SuccessfulResponse, Append to file failed: ${err}`);
		});
		res.status(201).json({
			...data,
			accessToken: accessToken,
			action: data['action' as keyof typeof data]
				? data['action' as keyof typeof data]
				: LocalAConfig.serviceAction.created,
			created: true,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in event logging: ${err}`);
	}
};

/**
 * @description Returns successful response with status code (202), Very limited usecases, if the request is accepted
 * but still pending changes on the server side.
 * @emits acceptedPending in the response
 * @param {Response} res: The response to be sent
 * @param {Object} data: the data to be sent
 * @returns {void}
 */
export const sendAcceptedPendingProcessingResponse = (
	res: Response,
	accessToken: string,
	data: Object
) => {
	try {
		if (!existsSync(eventsLogFolder)) {
			mkdirSync(eventsLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const eventToLog = `
*******************************************Start Of Event*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful => Responded with status code: (202) - Accepted and processing
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
Data retrieved: Successful 
*******************************************End Of Event*******************************************

	`;
		appendFile(eventsLogFile, eventToLog, 'utf8', (err) => {
			if (err) console.log(`SuccessfulResponse, Append to file failed: ${err}`);
		});
		res.status(202).json({
			...data,
			accessToken: accessToken,
			action: data['action' as keyof typeof data]
				? data['action' as keyof typeof data]
				: LocalAConfig.serviceAction.pending,
			acceptedPending: true,
		});
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in event logging: ${err}`);
	}
};

/**
 * @description Returns successful response with status code OK (204), if the request if just successful
 * but no content to return (no payLoad)
 * @param {Response} res: The response to be sent
 * @param {string} accessToken: the new provided refresh JWT is sent in the headers
 * @returns {void}
 */
export const sendAcceptedNoContentResponse = (
	res: Response,
	accessToken: string
) => {
	try {
		if (!existsSync(eventsLogFolder)) {
			mkdirSync(eventsLogFolder, { recursive: true });
		}
		const reqBody = res.req.body as REQBODY;

		const eventToLog = `
*******************************************Start Of Event*******************************************
*******************************@${getDateInEgypt()}*******************************

Successful, No Content => Responded with status code: (204) - No Content
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
Data retrieved: No data 
*******************************************End Of Event*******************************************

	`;
		appendFile(eventsLogFile, eventToLog, 'utf8', (err) => {
			if (err) console.log(`SuccessfulResponse, Append to file failed: ${err}`);
		});
		res.setHeader('Auuthorization', accessToken).status(204);
	} catch (error) {
		const err = new Error(`S${error}`);
		console.log(`Eroor in event logging: ${err}`);
	}
};
