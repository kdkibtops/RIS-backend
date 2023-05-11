import { LocalAConfig } from './../config/LocalConfiguration';
import { Request, Response, Router, NextFunction } from 'express';
import { QueryObject, REQBODY } from '../config/types';
import {
	deleteUser,
	insertUser,
	searcFilterhUsers,
	searchUsers,
	showAllUsers,
	updateUser,
} from '../Models/Users';

import bcrypt, { genSaltSync } from 'bcrypt';
import { refreshAccessToken } from '../Authentication/MiddleWares/HandleToken';
import { sendServerError } from '../ResponseHandler/ServerError';
import {
	sendBadRequestResponse,
	sendNotFoundResponse,
} from '../ResponseHandler/ClientError';
import {
	sendAcceptedCreatedResponse,
	sendAcceptedUpdatedResponse,
	sendSuccessfulResponse,
} from '../ResponseHandler/SuccessfulResponse';
import { ValidateObjectPresentInRequestBody } from '../helpers/RequestValidation';

/**Handles isnert a new user to the database*/
async function insertNewUser(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		let proceed = ValidateObjectPresentInRequestBody('users', req, res);
		if (!proceed) {
			return;
		} else {
			const user = reqBody.users;
			// checks if user is present or not
			const userPresentResponse = await searchUsers(reqBody, (err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			});
			if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries === 0
			) {
				const hashedPassword = bcrypt.hashSync(
					user.user_password as string,
					genSaltSync()
				);
				user.user_password = hashedPassword;
				const data = await insertUser(reqBody, (err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				});
				if (data.feedback === LocalAConfig.serviceStatus.success) {
					return sendAcceptedCreatedResponse(res, newToken, data);
				}
			}
			/**User already present return bad request and state*/
			if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries > 0
			) {
				const err = new Error(
					LocalAConfig.errorMessages.logMessages.userAlreadyPresentInDB
				);
				err.name = LocalAConfig.errorNames.badReuest.userAlreadyPresentInDB;
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: {
							message:
								LocalAConfig.errorMessages.toSendMessages
									.userAlreadyPresentInDB,
						},
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			} else if (!userPresentResponse.feedback) {
				const err = new Error();
				err.name = LocalAConfig.errorNames.unknownError;
				err.message =
					LocalAConfig.errorMessages.logMessages.unknownError(`inserting user`);
				return sendServerError(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			}
		}
	} catch (error) {
		const err = error as Error;
		sendServerError(
			res,
			{
				accessToken: newToken,
				action: LocalAConfig.serviceAction.failed,
				data: { message: err.message },
			},
			err as Error
		);
	}
}
/**Hadnles show all users in the database*/
async function showAllUsersInDatabase(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		/** gets all users from the database*/
		const userPresentResponse = await showAllUsers((err: Error) => {
			sendBadRequestResponse(
				res,
				{
					accessToken: newToken,
					data: { message: err.message },
					action: LocalAConfig.serviceAction.failed,
				},
				err
			);
		});
		if (userPresentResponse.feedback === LocalAConfig.serviceStatus.success) {
			return sendSuccessfulResponse(res, newToken, {
				data: [...userPresentResponse.data],
			});
		} else {
			const error = new Error(
				LocalAConfig.errorMessages.logMessages.canNotMessages('show all users')
			);
			error.name =
				LocalAConfig.errorMessages.logMessages.unknownError(`Show all users`);
			return sendServerError(
				res,
				{
					accessToken: newToken,
					action: LocalAConfig.serviceAction.failed,
					data: {
						message: LocalAConfig.errorMessages.logMessages.unknownError(
							`processing searchUsersDatabase () in users handler`
						),
					},
				},
				error
			);
		}
	} catch (error) {
		const err = error as Error;
		sendServerError(
			res,
			{
				accessToken: newToken,
				action: LocalAConfig.serviceAction.failed,
				data: { message: err.message },
			},
			err as Error
		);
	}
}
/** Handles update existing user in the database  */
async function updateOldUser(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		let proceed = ValidateObjectPresentInRequestBody('users', req, res);
		if (!proceed) {
			return;
		} else {
			const user = reqBody.users;
			/**checks if user is present */
			const userPresentResponse = await searchUsers(reqBody, (err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			});
			if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries > 0
			) {
				if (user.user_password) {
					const hashedPassword = bcrypt.hashSync(
						user.user_password as string,
						genSaltSync()
					);
					user.user_password = hashedPassword;
				}
				const data = await updateUser(reqBody, (err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				});
				if (data.feedback === LocalAConfig.serviceStatus.success) {
					return sendAcceptedUpdatedResponse(res, newToken, data);
				}
			} else if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries === 0
			) {
				const error = new Error(
					LocalAConfig.errorMessages.toSendMessages.UIDNotPresentInDatabase(
						'User',
						user.username
					)
				);
				error.name = 'Wrong username';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'User not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!userPresentResponse.feedback) {
				const err = new Error();
				err.name = LocalAConfig.errorNames.unknownError;
				err.message = LocalAConfig.errorMessages.logMessages.unknownError(
					'update user handler'
				);
				return sendServerError(
					res,
					{
						accessToken: '',
						data: {
							message: LocalAConfig.errorMessages.logMessages.unknownError(
								'update user handler'
							),
						},
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			}
		}
	} catch (error) {
		const err = error as Error;
		sendServerError(
			res,
			{
				accessToken: newToken,
				action: LocalAConfig.serviceAction.failed,
				data: { message: err.message },
			},
			err as Error
		);
	}
}
/** Handles delete existing user from the database*/
async function deleteOldUser(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		let proceed = ValidateObjectPresentInRequestBody('users', req, res);
		if (!proceed) {
			return;
		} else {
			const user = reqBody.users;
			/** checks if patient is present*/
			const userPresentResponse = await searchUsers(reqBody, (err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			});
			if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries > 0
			) {
				const data = await deleteUser(reqBody.users, (err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				});
				if (data.feedback === LocalAConfig.serviceStatus.success) {
					return sendSuccessfulResponse(res, newToken, data);
				}
			} else if (
				userPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				userPresentResponse.enteries === 0
			) {
				const error = new Error(
					LocalAConfig.errorMessages.toSendMessages.UIDNotPresentInDatabase(
						'User',
						user.username
					)
				);
				error.name = 'Wrong user username ';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'User not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!userPresentResponse.feedback) {
				const err = new Error();
				err.name = LocalAConfig.errorNames.unknownError;
				err.message = LocalAConfig.errorMessages.logMessages.unknownError(
					'Deleting user handler'
				);
				return sendServerError(
					res,
					{
						accessToken: '',
						data: {
							message:
								LocalAConfig.errorMessages.toSendMessages.unknownError(
									'deleting user'
								),
						},
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			}
		}
	} catch (error) {
		const err = error as Error;
		sendServerError(
			res,
			{
				accessToken: newToken,
				action: LocalAConfig.serviceAction.failed,
				data: { message: err.message },
			},
			err as Error
		);
	}
}
/** Handles  search user in the database on filters LIKE % no exact match*/
async function queryUsers(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).orders, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('query', req, res);
		if (!proceed) {
			return;
		} else {
			const query = req.body.query as QueryObject;
			const data = await searcFilterhUsers(query, (err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceAction.failed,
					},
					err
				);
			});
			sendSuccessfulResponse(res, newToken, data);
		}
	} catch (error) {
		const err = error as Error;
		sendServerError(
			res,
			{
				accessToken: newToken,
				action: LocalAConfig.serviceAction.failed,
				data: { message: err.message },
			},
			err as Error
		);
	}
}

/**Routes */

const usersHandler = Router();

usersHandler.post(LocalAConfig.routes.insert, insertNewUser);
usersHandler.post(
	LocalAConfig.routes.showAll,
	refreshAccessToken,
	showAllUsersInDatabase
);
usersHandler.post(LocalAConfig.routes.delete, deleteOldUser);
usersHandler.post(LocalAConfig.routes.update, updateOldUser);
usersHandler.post(LocalAConfig.routes.query, queryUsers);

export default usersHandler;
