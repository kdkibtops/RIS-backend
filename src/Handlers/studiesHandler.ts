import { Request, Response, Router, NextFunction } from 'express';
import {
	deleteStudy,
	insertStudy,
	searchStudies,
	showAllStudies,
	updateStudy,
} from '../Models/Studies';
import { REQBODY } from '../config/types';
import { searcFilterhPatients } from '../Models/Patients';
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
	ValidateUserPresent,
} from '../helpers/RequestValidation';

/**Handles Inserting new study to the database */
async function insertNewStudy(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).studies, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('studies', req, res);
		proceed = await ValidateUserPresent(req, res, {
			table: 'studies',
			colName: 'updated_by',
		});
		if (!proceed) {
			return;
		} else {
			/**checks if study is present*/
			const studyPresentResponse = await searchStudies(
				reqBody,
				(err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				}
			);
			if (
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries === 0
			) {
				const data = await insertStudy(reqBody, (err: Error) => {
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
					return sendAcceptedCreatedResponse(res, newToken, data);
			}
			/**update study data if study is already present*/
			if (
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries > 0
			) {
				const data = await updateStudy(reqBody, (err: Error) => {
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
					return sendAcceptedUpdatedResponse(res, newToken, updatedData);
				}
			} else if (!studyPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in updating/inserting studies`;
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
/**Handles returns all studies in the database*/
async function showAllStudiesInDatabase(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		Object.assign(req.body as REQBODY, { studies: { updated_by: '' } });
		const currentUser = req.body.currentUser;
		(req.body as REQBODY).studies.updated_by = currentUser;
		/** gets all studies from the database */
		const allStudiesInDatabase = await showAllStudies((err: Error) => {
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
		if (allStudiesInDatabase.feedback === LocalAConfig.serviceStatus.success) {
			return sendSuccessfulResponse(res, newToken, {
				data: [...allStudiesInDatabase.data],
			});
		} else {
			const error = new Error(`Can't shows all studies`);
			error.name = `Unknown error`;
			error.message = `Unknown Error in updating/inserting studies`;
			return sendServerError(
				res,
				{
					accessToken: newToken,
					action: LocalAConfig.serviceAction.failed,
					data: {
						message:
							'Unknown error in processing searchPatientsDatabase () in patients handler',
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
/** Handles update existing study in the database*/
async function updateOldStudy(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).studies, { updated_by: currentUser });
		(req.body as REQBODY).studies.updated_by = currentUser;
		let proceed = ValidateObjectPresentInRequestBody('studies', req, res);
		proceed = await ValidateUserPresent(req, res, {
			table: 'studies',
			colName: 'updated_by',
		});
		if (!proceed) {
			return;
		} else {
			const study = reqBody.studies;
			/**checks if study is present*/
			const studyPresentResponse = await searchStudies(
				reqBody,
				(err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				}
			);
			if (
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries > 0
			) {
				const data = await updateStudy(reqBody, (err: Error) => {
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
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries === 0
			) {
				const error = new Error(
					LocalAConfig.errorMessages.toSendMessages.UIDNotPresentInDatabase(
						'Study',
						study.study_id
					)
				);
				error.name = 'Wrong study study_id';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Study not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!studyPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in updating/inserting studies`;
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
/**Handles delete existing study from the database*/
async function deleteOldStudy(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).studies, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('studies', req, res);
		if (!proceed) {
			return;
		} else {
			const study = reqBody.studies;
			/**checks if study is present*/
			const studyPresentResponse = await searchStudies(
				reqBody,
				(err: Error) => {
					sendBadRequestResponse(
						res,
						{
							accessToken: newToken,
							data: { message: err.message },
							action: LocalAConfig.serviceAction.failed,
						},
						err
					);
				}
			);
			if (
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries > 0
			) {
				const data = await deleteStudy(study, (err: Error) => {
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
				studyPresentResponse.feedback === LocalAConfig.serviceStatus.success &&
				studyPresentResponse.enteries === 0
			) {
				const error = new Error(
					LocalAConfig.errorMessages.toSendMessages.UIDNotPresentInDatabase(
						'Study',
						study.study_id
					)
				);
				error.name = 'Wrong study study_id';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Study not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!studyPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in updating/inserting studies`;
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
/**searches users in the database on filters LIKE % no exact match*/
async function queryUsers(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).studies, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('query', req, res);
		if (!proceed) {
			return;
		} else {
			if (!ValidateObjectPresentInRequestBody('query', req, res)) return;
			const query = req.body.query;
			const data = await searcFilterhPatients(query, (err: Error) => {
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

/**Studies Router */
const studyHandler = Router();

studyHandler.post(LocalAConfig.routes.insert, insertNewStudy);
studyHandler.post(LocalAConfig.routes.showAll, showAllStudiesInDatabase);
studyHandler.post(LocalAConfig.routes.delete, deleteOldStudy);
studyHandler.post(LocalAConfig.routes.update, updateOldStudy);
studyHandler.post(LocalAConfig.routes.query, queryUsers);

export default studyHandler;
