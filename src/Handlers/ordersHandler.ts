import { Request, Response, Router } from 'express';
import { QueryObject, REQBODY } from '../config/types';
import {
	deleteOrder,
	insertOrder,
	searcFilterhOrders,
	searchOrders,
	showAllOrders,
	updateOrder,
} from '../Models/Orders';
import {
	sendBadRequestResponse,
	sendNotFoundResponse,
} from '../ResponseHandler/ClientError';
import {
	sendAcceptedCreatedResponse,
	sendAcceptedUpdatedResponse,
	sendSuccessfulResponse,
} from '../ResponseHandler/SuccessfulResponse';
import { sendServerError } from '../ResponseHandler/ServerError';
import { LocalAConfig } from '../config/LocalConfiguration';
import {
	ValidateObjectPresentInRequestBody,
	ValidatePatientPresent,
	ValidateStudyPresent,
	ValidateUserPresent,
} from '../helpers/RequestValidation';

/** Handles isnerting a new order to the database */
async function insertNewOrder(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).orders, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('orders', req, res);
		proceed = await ValidatePatientPresent(req, res, reqBody.orders.mrn);
		proceed = await ValidateStudyPresent(req, res, reqBody.orders.study);
		proceed = await ValidateUserPresent(req, res, {
			table: 'orders',
			colName: 'updated_by',
		});
		if (!proceed) {
			return;
		} else {
			// checks if order is present or not
			const orderPresentResponse = await searchOrders(reqBody, (err: Error) => {
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
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries === 0
			) {
				const data = await insertOrder(reqBody, (err: Error) => {
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
				if (data.feedback === LocalAConfig.serviceStatus.success)
					return sendAcceptedCreatedResponse(res, newToken, {
						...data,
					});
			}
			// update order data if order is already present
			if (
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries > 0
			) {
				const data = await updateOrder(reqBody, (err: Error) => {
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
					const updatedData = {
						...data,
						action: LocalAConfig.serviceAction.updated,
					};
					return sendAcceptedUpdatedResponse(res, newToken, {
						...data,
					});
				}
			} else if (!orderPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknonwn Error in updating/inserting orders`;
				return sendServerError(
					res,
					{
						accessToken: '',
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
/**Handles show all orders in database */
async function showAllOrdersInDatabase(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		Object.assign(req.body as REQBODY, { orders: { updated_by: '' } });
		const currentUser = req.body.currentUser;
		(req.body as REQBODY).orders.updated_by = currentUser;
		// checks if Order is present or not
		const allOrdersInDatabase = await showAllOrders((err: Error) => {
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
		if (allOrdersInDatabase.feedback === LocalAConfig.serviceStatus.success) {
			return sendSuccessfulResponse(res, newToken, {
				data: [...allOrdersInDatabase.data],
			});
		} else {
			const error = new Error(`Can't show all orders`);
			error.name = 'showAllOrders Error';
			return sendServerError(
				res,
				{
					accessToken: newToken,
					action: LocalAConfig.serviceAction.failed,
					data: {
						message:
							'Unknown error in processing searchOrdersDatabase () in orders handler',
					},
				},
				error as Error
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
/** Handles update existing order in the database  */
async function updateOldOrder(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).orders, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('orders', req, res);
		proceed = await ValidatePatientPresent(req, res, reqBody.orders.mrn);
		proceed = await ValidateStudyPresent(req, res, reqBody.orders.study);
		proceed = await ValidateUserPresent(req, res, {
			table: 'orders',
			colName: 'updated_by',
		});
		if (!proceed) {
			return;
		} else {
			const order = reqBody.orders;
			// checks if order is present => updates the entry
			const orderPresentResponse = await searchOrders(reqBody, (err: Error) => {
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
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries > 0
			) {
				const data = await updateOrder(reqBody, (err: Error) => {
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
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries === 0
			) {
				const error = new Error(
					`Bad Request, Order ${order.order_id} is not found in the request database`
				);
				error.name = 'Wrong order ID';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Order not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!orderPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknonwn Error in updating orders`;
				return sendServerError(
					res,
					{
						accessToken: '',
						data: {},
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
			err
		);
	}
}
/** Handles delete existing order from the database*/
async function deleteOldOrder(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).orders, { updated_by: currentUser });
		if (!ValidateObjectPresentInRequestBody('orders', req, res)) return;
		let proceed = ValidateObjectPresentInRequestBody('orders', req, res);
		if (!proceed) {
			return;
		} else {
			const order = reqBody.orders;
			// checks if order is present => delete the entry
			const orderPresentResponse = await searchOrders(reqBody, (err: Error) => {
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
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries > 0
			) {
				const data = await deleteOrder(order, (err: Error) => {
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
					return sendSuccessfulResponse(res, newToken, {
						...data,
					});
				}
			} else if (
				orderPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				orderPresentResponse.enteries === 0
			) {
				const error = new Error(
					`Bad Request, Order ${order.order_id} is not found in the request database`
				);
				error.name = 'Wrong order ID';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Order not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!orderPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknonwn Error in Deleting orders`;
				return sendServerError(
					res,
					{
						accessToken: '',
						data: {},
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
			err
		);
	}
}
/** Handles  search order in the database on filters LIKE % no exact match*/
async function queryOrders(req: Request, res: Response) {
	// recieves new token from middleware and sends it back to the patient
	const newToken = req.body.token || '';
	try {
		let proceed = ValidateObjectPresentInRequestBody('query', req, res);
		if (!proceed) {
			return;
		} else {
			const query = req.body.query as QueryObject;
			const data = await searcFilterhOrders(query, (err: Error) => {
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
			sendSuccessfulResponse(res, newToken, { ...data });
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
			err
		);
	}
}

/**Routes */

const orderHandler = Router();

orderHandler.post(LocalAConfig.routes.insert, insertNewOrder);
orderHandler.post(LocalAConfig.routes.showAll, showAllOrdersInDatabase);
orderHandler.post(LocalAConfig.routes.delete, deleteOldOrder);
orderHandler.post(LocalAConfig.routes.update, updateOldOrder);
orderHandler.post(LocalAConfig.routes.query, queryOrders);

export default orderHandler;
