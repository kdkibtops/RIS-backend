import { searchPatients } from '../Models/Patients';
import { searchStudies } from '../Models/Studies';
import { searchUsers } from '../Models/Users';
import { sendBadRequestResponse } from '../ResponseHandler/ClientError';
import { LocalAConfig } from '../config/LocalConfiguration';
import { REQBODY } from '../config/types';
import { Request, Response } from 'express';

/**Validates that the updating/inserting/deleting user is present in the users table in database
 * to be used while inserting/updating studies, patients, & orders*/
export const ValidateUserPresent = async (
	req: Request,
	res: Response,
	findUser: {
		table: 'studies' | 'patients' | 'orders';
		colName: 'updated_by' | 'registered_by';
	}
): Promise<boolean> => {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';

	try {
		const reqBody = req.body as REQBODY;
		const reqBodyObj = reqBody[findUser.table as keyof typeof reqBody];
		const updatingUser = reqBodyObj[
			findUser.colName as keyof typeof reqBodyObj
		] as string;

		const userPresent = await searchUsers(
			{ users: { username: updatingUser } } as REQBODY,
			(err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceStatus.failed,
					},
					err
				);
			}
		);
		if (userPresent.enteries === 0) {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.constraintNotFound.userNotFound
			);
			err.name = LocalAConfig.errorNames.badReuest.improperConstruction;
			sendBadRequestResponse(
				res,
				{
					accessToken: newToken,
					data: { message: err.message },
					action: LocalAConfig.serviceStatus.failed,
				},
				err
			);
			return false;
		} else {
			return true;
		}
	} catch (error) {
		return false;
	}
};
/**Validates that patients is present in the patients table in database
 * to be used while inserting, updating orders only*/
export const ValidatePatientPresent = async (
	req: Request,
	res: Response,
	mrn: string
): Promise<boolean> => {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';

	try {
		const userPresent = await searchPatients(
			{ patients: { mrn: mrn } } as REQBODY,
			(err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceStatus.failed,
					},
					err
				);
			}
		);
		if (userPresent.enteries === 0) {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.constraintNotFound.patientNotFound
			);
			err.name = LocalAConfig.errorNames.badReuest.improperConstruction;
			sendBadRequestResponse(
				res,
				{
					accessToken: newToken,
					data: { message: err.message },
					action: LocalAConfig.serviceStatus.failed,
				},
				err
			);
			return false;
		} else {
			return true;
		}
	} catch (error) {
		return false;
	}
};
/**Validates that the study is present in the patients table in database
 * to be used while inserting, updating orders only*/
export const ValidateStudyPresent = async (
	req: Request,
	res: Response,
	study_id: string
): Promise<boolean> => {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';

	try {
		const userPresent = await searchStudies(
			{ studies: { study_id: study_id } } as REQBODY,
			(err: Error) => {
				sendBadRequestResponse(
					res,
					{
						accessToken: newToken,
						data: { message: err.message },
						action: LocalAConfig.serviceStatus.failed,
					},
					err
				);
			}
		);
		if (userPresent.enteries === 0) {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.constraintNotFound.studyNotFound
			);
			err.name = LocalAConfig.errorNames.badReuest.improperConstruction;
			sendBadRequestResponse(
				res,
				{
					accessToken: newToken,
					data: { message: err.message },
					action: LocalAConfig.serviceStatus.failed,
				},
				err
			);
			return false;
		} else {
			return true;
		}
	} catch (error) {
		return false;
	}
};
/**Validates that the object we will process is present in Request Body */
export const ValidateObjectPresentInRequestBody = (
	obj: 'users' | 'studies' | 'patients' | 'orders' | 'query',
	req: Request,
	res: Response
): boolean => {
	/**Recieves new token from middleware and sends it back to the client*/
	const newToken = req.body.token || '';
	try {
		if (req.body[obj]) {
			return true;
		} else {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.objectNotFoundInRequestBody.customObjNotFound(
					obj
				)
			);
			err.name = LocalAConfig.errorNames.badReuest.improperConstruction;
			sendBadRequestResponse(
				res,
				{
					accessToken: newToken,
					data: { message: err.message },
					action: LocalAConfig.serviceStatus.failed,
				},
				err
			);
			return false;
		}
	} catch (error) {
		return false;
	}
};
