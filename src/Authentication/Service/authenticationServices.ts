import jwt from 'jsonwebtoken';
import bcrypt, { genSaltSync } from 'bcrypt';
import {
	AuthenticationReqBody,
	RegisterationReqBody,
} from '../../config/types';
import client from '../../database';
import { setupData } from '../../config/config';
import { User } from '../../Models/Users';
import { FailedStatus, LocalAConfig } from '../../config/LocalConfiguration';

const tokenSecret = setupData.JWT_access_secret;

export const showUser = async (
	queryColumn: string,
	queryValue: string
): Promise<User | null> => {
	try {
		const SQL = `SELECT * FROM main.users WHERE ${queryColumn} = '${queryValue}'`;
		const conn = await client.connect();
		const result = await conn.query(SQL);
		if (result.rowCount) {
			delete result.rows[0].user_password;
		}
		conn.release();
		return result.rows[0];
	} catch (error) {
		console.log(`${error}`);
		return null;
	}
};

// ------ ! -------- Start of user service functions ------ ! --------

// Register new user
export const registeruser = async (
	reqBody: RegisterationReqBody,
	callBackErr?: Function
): Promise<User> => {
	try {
		const tableName = 'users';

		const hashedPassword = bcrypt.hashSync(
			reqBody.user_password,
			genSaltSync()
		);
		reqBody.user_password = hashedPassword;
		let enteries = Object.entries(reqBody);
		const columnNames = enteries.map((e) => e[0]);
		const values = enteries.map((e) => e[1]);
		columnNames.push('created');
		values.push(new Date().toISOString());
		const valuesSQL = values.map((val) => `'${val}'`);
		const SQL = `INSERT INTO main.${tableName} 
            (${[...columnNames]})
            VALUES  
            (${valuesSQL})
            RETURNING
            *;
            `;
		const conn = await client.connect();
		const rawResult = await client.query(SQL);
		conn.release();
		const result = rawResult.rows[0];
		const response: User = {
			full_name: result.full_name,
			username: result.username,
		};
		return response;
	} catch (error) {
		console.log(`${error}`);
		return {
			username: '',
		};
	}
};

// ------ ! -------- Start of authentication service functions ------ ! --------

/**Checks users credentials against database, if correct it will supply JWT to response
 * JWT can be stored in localstorage or cookie for further sign in
 * */
export async function authentication(
	reqBody: AuthenticationReqBody,
	callBackErr?: Function
): Promise<
	| { result: true; accessToken: string; full_name: string; username: string }
	| { result: null; message: string }
	| { result: false; message: string }
	| { result: FailedStatus }
> {
	try {
		/**Return null if res.status is sent to avoid resetting headers */
		const authUser = await authenticateUser(
			reqBody,
			callBackErr && callBackErr
		);
		if (authUser.authStatus === true) {
			return {
				result: authUser.authStatus,
				accessToken: authUser.jwt,
				full_name: authUser.full_name,
				username: authUser.username,
			};
		} else if (authUser.authStatus === false && !authUser.err) {
			if (authUser.username) {
				return {
					result: null,
					message: LocalAConfig.errorMessages.toSendMessages.wrongPassword,
				};
			} else {
				return {
					result: null,
					message: LocalAConfig.errorMessages.toSendMessages.usernameNotFound,
				};
			}
		} else {
			return { result: LocalAConfig.serviceStatus.failed };
		}
	} catch (error) {
		if (callBackErr) {
			callBackErr(error as Error);
			return { result: LocalAConfig.serviceStatus.failed };
		} else {
			console.log(`Error: ${error}`);
			return { result: LocalAConfig.serviceStatus.failed };
		}
	}
}

/**Check if user is authenticated, supply JWT to response body to be pass to req.header later on
 * @returns {{ jwt: string; full_name: string; username: string; authStatus: true }}: if success
 * @returns {{ jwt: ''; full_name: null; username: null; authStatus: false }}: if username is not found
 * @returns {{ jwt: ''; full_name: string; username: string; authStatus: false }}:  if password is incorrect
 * @returns {{ authStatus: false; message: 'Unknown error' }}:  if other errors
 */
export async function authenticateUser(
	reqBody: AuthenticationReqBody,
	callBackErr?: Function
): Promise<
	| {
			jwt: string;
			full_name: string;
			username: string;
			authStatus: true;
			err: null;
	  }
	| { jwt: ''; full_name: null; username: null; authStatus: false; err: null }
	| {
			jwt: '';
			full_name: string;
			username: string;
			authStatus: false;
			err: null;
	  }
	| { authStatus: false; username: null; message: 'Unknown error'; err: Error }
> {
	const username: string = reqBody.username as string;
	const password: string = reqBody.user_password as string;
	const auth = await authenticate(
		username,
		password,
		callBackErr && callBackErr
	);
	console.log(`'${username}' authenticated: ${auth.status}`);

	if (auth.status === true) {
		const BEARER_JWT = jwt.sign({ username: username }, tokenSecret, {
			expiresIn: LocalAConfig.tokenExpiry,
		});
		const JWT: {
			jwt: string;
			full_name: string;
			username: string;
			authStatus: true;
			err: null;
		} = {
			jwt: BEARER_JWT,
			full_name: auth.full_name as string,
			username: username,
			authStatus: auth.status,
			err: null,
		};
		return JWT;
	} else if (auth.status === false && auth.full_name === null) {
		return {
			jwt: '',
			full_name: null,
			username: null,
			authStatus: false,
			err: null,
		};
	} else if (auth.status === false) {
		return {
			jwt: '',
			full_name: auth.full_name as string,
			username: auth.username as string,
			authStatus: false,
			err: null,
		};
	} else {
		return {
			authStatus: false,
			username: null,
			message: 'Unknown error',
			err: new Error('Unknown error in authenticating the user'),
		};
	}
}

/** Compares user input password with password in DB and returns boolean DEBUGGED AND WORKING*/
export async function authenticate(
	username: string,
	password: string,
	callBackErr?: Function
): Promise<{
	status: boolean;
	full_name: string | null;
	username: string | null;
	role?: string | null;
}> {
	try {
		console.log('authenticate function');
		const conn = await client.connect();
		const sql = `SELECT user_id, user_password,full_name,username,user_role, job, email from main.users WHERE username ='${username}'`;
		const result = await conn.query(sql);
		conn.release();
		if (result.rowCount === 0) {
			// username is not found
			return { status: false, full_name: null, username: username };
		} else {
			// username is found
			const pass_digest = result.rows[0].user_password;
			const full_name = result.rows[0].full_name;
			const role = result.rows[0].role;
			const authenticated: boolean = bcrypt.compareSync(password, pass_digest);
			return {
				status: authenticated, //true if authenticated, false if not authenticated
				full_name: full_name, // will always return the full name
				username: username, // will always return the username
				role: role,
			};
		}
	} catch (error) {
		const err = error as Error;
		err.name = LocalAConfig.errorNames.authenticationError;
		if (callBackErr) {
			callBackErr(err);
		} else {
			console.log(`${error}`);
		}
		return { status: false, full_name: '', username: username };
	}
}

// ------ ! -------- End of authentication service functions ------ ! --------
