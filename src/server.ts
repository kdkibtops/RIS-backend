import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { setupData } from './config/config';
import { testDBConncetion } from './database';
import orderHandler from './Handlers/ordersHandler';
import usersHandler from './Handlers/usersHandler';
import patientHandler from './Handlers/patientsHandler';
import studyHandler from './Handlers/studiesHandler';
import filesHandler from './Handlers/FileUploadHandler';
import { refreshAccessToken } from './Authentication/MiddleWares/HandleToken';
import {
	sendServerError,
	sendServiceUnavailableError,
} from './ResponseHandler/ServerError';
import { sendSuccessfulResponse } from './ResponseHandler/SuccessfulResponse';
import path from 'path';

const radAssitApp = express();

radAssitApp.use(bodyParser.urlencoded({ extended: false }));
radAssitApp.use(bodyParser.json());
const corsOptions: cors.CorsOptions = {
	// origin: `http://localhost:3000`,
	origin: `${setupData.client_url}:${setupData.client_port}`,
	methods: 'GET, PUT, POST, DELETE, PATCH',
	allowedHeaders: `Access-Control-Allow-Credentials, Credentials, Authorization, Content-Type, Set-Cookie, Content-Disposition , Access-Control-Allow-Methods, Access-Control-Allow-Origin , Access-Control-Allow-Headers, order_id`,
	// allowedHeaders: `*`,
	credentials: true,
};

radAssitApp.use(cors(corsOptions));

const port = setupData.server_port;
const startServer = () =>
	console.log(`Reporting assist application started at port: ${port}`);
testDBConncetion();

const DBConnectionTest = async (
	req: express.Request,
	res: express.Response
) => {
	try {
		const testResult = await testDBConncetion();
		if (testResult.status === 'Connected') {
			console.log(`Front end db connection test: ${testResult}`);
			sendSuccessfulResponse(res, '', [testResult]);
		}
		if (testResult.status === 'Failed') {
			const err: Error = {
				name: 'Database Connection Failed',
				message: `Connection to database ${testResult.returnVal.databaseName} in Enviroment '${testResult.returnVal.enviroment}' is ${testResult.returnVal.connection}`,
				stack: `at Testdb Function in ${path.join(__dirname, '/server.js')}`,
			};
			sendServiceUnavailableError(
				res,
				{ accessToken: '', data: [], action: 'Failed' },
				err as Error
			);
		}
		if (testResult.status === 'Error') {
			sendServerError(
				res,
				{ accessToken: '', data: [], action: 'Failed' },
				testResult.retunVal as Error
			);
		}
	} catch (err) {
		sendServerError(
			res,
			{ accessToken: '', data: [], action: 'failed' },
			err as Error
		);
	}
};

radAssitApp.listen(port, startServer);

radAssitApp.get('/testdb', DBConnectionTest);
radAssitApp.use('/files', filesHandler);
radAssitApp.use('/orders', refreshAccessToken, orderHandler);
radAssitApp.use('/studies', refreshAccessToken, studyHandler);
radAssitApp.use('/users', usersHandler);
radAssitApp.use('/patients', refreshAccessToken, patientHandler);
