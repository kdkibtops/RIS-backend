import { Router, Request, Response } from 'express';
import {
	refreshAccessToken,
	verifyAccessToken,
} from '../MiddleWares/HandleToken';
import { authentication } from '../Service/authenticationServices';
import {
	sendAuthorzationSuccess,
	sendUnAuthenticated,
} from '../../ResponseHandler/AuthResponse';
import { sendBadRequestResponse } from '../../ResponseHandler/ClientError';
import { LocalAConfig } from '../../config/LocalConfiguration';

const authenticationRoutes = Router();

const authenticateUser = async (req: Request, res: Response) => {
	try {
		if (!req.body.users) {
			const error = new Error(
				LocalAConfig.errorMessages.logMessages.objectNotFoundInRequestBody.userNotFoundAuth
			);
			error.name = LocalAConfig.errorNames.badReuest.improperConstruction;
			return sendBadRequestResponse(
				res,
				{
					accessToken: '',
					data: {
						message: LocalAConfig.errorMessages.toSendMessages.badAuthRequest,
					},
					action: LocalAConfig.serviceStatus.failed,
				},
				error
			);
		}
		const auth = await authentication(req.body.users, (err: Error) => {
			sendUnAuthenticated(
				res,
				{
					data: { message: err.message },
					action: LocalAConfig.serviceStatus.failed,
				},
				err
			);
		});
		if (auth.result === true) {
			return sendAuthorzationSuccess(res, auth.accessToken, {
				action: LocalAConfig.serviceStatus.success,
				...auth,
			});
		} else if (auth.result === null) {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.AuthorizationError.authenticationFailed
			);
			err.name = LocalAConfig.errorNames.wrongCredentials;
			return sendUnAuthenticated(res, { ...auth }, err);
		} else {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.AuthorizationError.authenticationFailed
			);
			err.name = 'Unkown Error';
			return sendUnAuthenticated(res, { ...auth }, err);
		}
	} catch (error) {
		const err = error as Error;
		sendUnAuthenticated(
			res,
			{
				action: LocalAConfig.serviceStatus.failed,
				data: { message: err.message },
			},
			err
		);
	}
};

/**Still not being used */
const verifyToken = async (req: Request, res: Response) => {
	try {
		const user = await verifyAccessToken(
			req.headers['authorization'] as string,
			res
		);
		if (user) {
			res.status(200).json(user);
		}
	} catch (error) {
		console.log(`${error}`);
	}
};

/**Still not being used */
const renewToken = async (req: Request, res: Response) => {
	const newToken = req.body.token || '';
	try {
		if (newToken) {
			res.status(200).json({ data: {}, accessToken: newToken });
		}
	} catch (error) {
		console.log(`${error}`);
		res.status(500).json({ data: error, accessToken: newToken });
	}
};

authenticationRoutes.post(LocalAConfig.routes.authenticate, authenticateUser);
authenticationRoutes.post(LocalAConfig.routes.verifyToken, verifyToken);
authenticationRoutes.post(
	LocalAConfig.routes.refreshJWT,
	refreshAccessToken,
	renewToken
);

export default authenticationRoutes;
