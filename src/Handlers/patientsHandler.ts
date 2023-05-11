import { Request, Response, Router } from 'express';
import { QueryObject, REQBODY } from '../config/types';
import {
	deletePatient,
	insertPatient,
	searcFilterhPatients,
	searchPatients,
	showAllPatients,
	updatePatient,
} from '../Models/Patients';
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

/** Handles isnerting a new patient to the database */
async function insertNewPatient(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).patients, {
			registered_by: currentUser,
		});
		let proceed = ValidateObjectPresentInRequestBody('patients', req, res);
		proceed = await ValidateUserPresent(req, res, {
			table: 'patients',
			colName: 'registered_by',
		});
		if (!proceed) {
			return;
		} else {
			/**checks if patient is present*/
			const patientPresentResponse = await searchPatients(
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
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries === 0
			) {
				const data = await insertPatient(reqBody, (err: Error) => {
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
			/**Update patient data if patient is already present*/
			if (
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries > 0
			) {
				const data = await updatePatient(reqBody, (err: Error) => {
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
			} else if (!patientPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in updating/inserting patients`;
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
/**Handles show all patients in database */
async function showAllPatientsInDatabase(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		Object.assign(req.body as REQBODY, { patients: { registered_by: '' } });
		const currentUser = req.body.currentUser;
		(req.body as REQBODY).patients.registered_by = currentUser;
		/** gets all patients from the database*/
		const allPatientsInDatabase = await showAllPatients((err: Error) => {
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
		if (allPatientsInDatabase.feedback === LocalAConfig.serviceStatus.success) {
			return sendSuccessfulResponse(res, newToken, {
				data: [...allPatientsInDatabase.data],
			});
		} else {
			const error = new Error(`Can't show all patients`);
			error.name = 'Unknown Error';
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
/** Handles update existing patient in the database  */
async function updateOldPatient(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).patients, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('patients', req, res);
		proceed = await ValidateUserPresent(req, res, {
			table: 'patients',
			colName: 'registered_by',
		});
		if (!proceed) {
			return;
		} else {
			const patient = reqBody.patients;
			/**checks if patient is present */
			const patientPresentResponse = await searchPatients(
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
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries > 0
			) {
				const data = await updatePatient(reqBody, (err: Error) => {
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
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries === 0
			) {
				const error = new Error(
					`Bad Request, Patient ${patient.mrn} is not found in the request database`
				);
				error.name = 'Wrong patient mrn';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Patient not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!patientPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in updating patients`;
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
/** Handles delete existing patient from the database*/
async function deleteOldPatient(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const reqBody = req.body as REQBODY;
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).patients, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('patients', req, res);
		if (!proceed) {
			return;
		} else {
			const patient = reqBody.patients;
			/** checks if patient is present*/
			const patientPresentResponse = await searchPatients(
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
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries > 0
			) {
				const data = await deletePatient(patient, (err: Error) => {
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
				patientPresentResponse.feedback ===
					LocalAConfig.serviceStatus.success &&
				patientPresentResponse.enteries === 0
			) {
				const error = new Error(
					`Bad Request, Patient ${patient.mrn} is not found in the request database`
				);
				error.name = 'Wrong patient mrn';
				return sendNotFoundResponse(
					res,
					{
						accessToken: newToken,
						data: { message: 'Patient not found' },
						action: LocalAConfig.serviceAction.failed,
					},
					error
				);
			} else if (!patientPresentResponse.feedback) {
				const err = new Error();
				err.name = `Unknown error`;
				err.message = `Unknown Error in Deleting patients`;
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
/** Handles  search patients in the database on filters LIKE % no exact match*/
async function queryPatients(req: Request, res: Response) {
	/**Recieves new token from middleware and sends it back to the patient*/
	const newToken = req.body.token || '';
	try {
		const currentUser = req.body.currentUser;
		Object.assign((req.body as REQBODY).patients, { updated_by: currentUser });
		let proceed = ValidateObjectPresentInRequestBody('query', req, res);
		if (!proceed) {
			return;
		} else {
			if (!ValidateObjectPresentInRequestBody('query', req, res)) return;
			const query = req.body.query as QueryObject;
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
			err
		);
	}
}

/**Patients Router */
const patientHandler = Router();

patientHandler.post(LocalAConfig.routes.insert, insertNewPatient);
patientHandler.post(LocalAConfig.routes.showAll, showAllPatientsInDatabase);
patientHandler.post(LocalAConfig.routes.delete, deleteOldPatient);
patientHandler.post(LocalAConfig.routes.update, updateOldPatient);
patientHandler.post(LocalAConfig.routes.query, queryPatients);

export default patientHandler;
