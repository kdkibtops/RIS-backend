export const UID_Columns = [
	'mrn',
	'username',
	'user_id',
	'study_id',
	'order_id',
];
export const arrayColumns = []; //put here the columns that needs to be inserted as array

export type FailedStatus = 'failed';
export type SuccessStatus = 'success';

export const LocalAConfig = {
	dataTimeConfig: { DayLightTimeSaving: true },
	successfulMessages: {},
	errorMessages: {
		logMessages: {
			objectNotFoundInRequestBody: {
				userNotFoundAuth:
					'Bad Request, User {} is not found in the Authorization request body',
				userNotFound: 'Bad Request, User {} is not found in the request body',
				patientNotFound:
					'Bad Request, patient {} is not found in the request body',
				studyNotFound: 'Bad Request, study {} is not found in the request body',
				orderNotFound: 'Bad Request, order {} is not found in the request body',
				queryNotFound: 'Bad Request, query {} is not found in the request body',
				customObjNotFound: (obj: string) =>
					`Bad Request, ${obj} {} is not found in the request body`,
			},
			AuthorizationError: {
				badAuthRequest: '',
				authenticationFailed: 'Authenticatiion failed',
				authorizationFailed: 'Authorization failed',
				JWTisNull: 'JWT is null || not send in Authorization Header',
			},
			constraintNotFound: {
				userNotFound:
					'Due to F-Key constraint in database, request will fail becasue username is not found in the users table in database',
				patientNotFound:
					'Due to F-Key constraint in database, request will fail becasue patient mrn is not found in the patients table in database',
				studyNotFound:
					'Due to F-Key constraint in database, request will fail becasue study_id is not found in the studies table in database',
			},
			userAlreadyPresentInDB: 'Username already present in the database',
			canNotMessages: (txt: string) => `Can't ${txt}`,
			unknownError: (txt: string) => `Unknown error in ${txt}`,
		},
		toSendMessages: {
			UIDNotPresentInDatabase: (obj: string, UID: string) =>
				`Bad Request, ${obj}: ${UID} is not found in the  database`,
			BadRequest: 'Bad request sent to the server',
			badAuthRequest: '',
			authError: 'Authentication Error',
			tokenIsNull: 'Authorization headers are not provided properly',
			usernameNotFound: 'username not found',
			wrongPassword: 'Wrong password',
			notVerified: 'JWT not verified',
			userAlreadyPresentInDB: `Username is already present in database, try "Logging in" if registered, otherwise choose another username`,
			unknownError: (err: string) => `Unknown error in ${err}`,
		},
		systemMessages: {
			accessDenied: `Wrong password, Access denied`,
		},
	},
	errorNames: {
		badReuest: {
			improperConstruction: 'Immproperly Contructed Authentication Request',
			userAlreadyPresentInDB: 'Username already present',
		},
		wrongCredentials: 'Wrong credentials',
		jwtVerificationError: 'JWT Verification Error',
		JWTisNull: 'JWT is null Error',
		refreshJWTError: 'Error in JWT refresh function',
		authenticationError: 'Authentication Error',
		unknownError: `Unknown error `,
	},
	serviceStatus: {
		success: 'success' as SuccessStatus,
		failed: 'failed' as FailedStatus,
	},
	serviceAction: {
		created: 'Created',
		updated: 'Updated',
		deleted: 'Deleted',
		success: 'Succeeded',
		failed: 'Failed',
		pending: 'pending',
	},
	routes: {
		insert: '/insert',
		update: '/update',
		delete: '/delete',
		showAll: '/index',
		showOne: '/showone',
		query: '/query',
		authenticate: '/authenticate',
		verifyToken: '/verifytoken',
		refreshJWT: '/refjwt',
	},
	tokenExpiry: '30m',
};
