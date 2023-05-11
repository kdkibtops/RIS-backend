import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { setupData } from '../../config/config';
import { sendUnAuthenticated } from '../../ResponseHandler/AuthResponse';
import { sendServerError } from '../../ResponseHandler/ServerError';
import { LocalAConfig } from '../../config/LocalConfiguration';
import { User } from '../../Models/Users';

const tokenSecret = setupData.JWT_access_secret;

export async function verifyAccessToken(token: string, res: Response) {
	try {
		let user = null;
		jwt.verify(token, tokenSecret, (err, usr) => {
			if (err) return res.status(401).json({ authentication: false });
			user = usr;
		});
		if (user !== null) return user;
	} catch (error) {
		const err = error as Error;
		err.name = LocalAConfig.errorNames.jwtVerificationError;
		sendServerError(
			res,
			{
				accessToken: '',
				data: { message: err.message },
				action: LocalAConfig.serviceStatus.failed,
			},
			err
		);
	}
}

// middleware to be used before each API request to generate new accessToken valid for 30 minutes
export async function refreshAccessToken(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		if (token == null) {
			const err = new Error(
				LocalAConfig.errorMessages.logMessages.AuthorizationError.JWTisNull
			);
			err.name = LocalAConfig.errorNames.JWTisNull;
			sendUnAuthenticated(
				res,
				{ message: LocalAConfig.errorMessages.toSendMessages.tokenIsNull },
				err
			);
		}
		jwt.verify(token || '', tokenSecret, (err, usr) => {
			if (err) {
				sendUnAuthenticated(
					res,
					{
						message: LocalAConfig.errorMessages.toSendMessages.authError,
					},
					err as Error
				);
			} else {
				let user = usr as User;
				console.log('verified');
				const newToken = jwt.sign(
					{
						username: user.username,
					},
					tokenSecret,
					{ expiresIn: LocalAConfig.tokenExpiry }
				);
				Object.assign(req.body, {
					token: newToken,
					currentUser: user.username,
				});
				console.log('New token provided');
				next();
			}
		});
	} catch (error) {
		const err = error as Error;
		err.name = LocalAConfig.errorNames.refreshJWTError;
		sendServerError(
			res,
			{
				accessToken: '',
				data: { message: err.message },
				action: LocalAConfig.serviceStatus.failed,
			},
			err
		);
	}
}
