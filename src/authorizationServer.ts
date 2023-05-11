import bodyParser from 'body-parser';
import { setupData } from './config/config';
import express from 'express';
import cors from 'cors';
import authenticationRoutes from './Authentication/Handlers/AuthenticationHandler';

const port = setupData.auth_server_port;
const authServer = express();
authServer.use(bodyParser.urlencoded({ extended: false }));
authServer.use(bodyParser.json());
const corsOptions: cors.CorsOptions = {
	// origin: `http://localhost:3000`,
	origin: `${setupData.client_url}:${setupData.client_port}`,
	methods: 'GET, PUT, POST, DELETE, PATCH',
	allowedHeaders: `Access-Control-Allow-Credentials,Credentials, Authorization, Content-Type, Set-Cookie, Content-Disposition , Access-Control-Allow-Methods, Access-Control-Allow-Origin , Access-Control-Allow-Headers`,
	credentials: true,
};

authServer.use(cors(corsOptions));
const startServer = () => {
	console.log(`auth server started at port: ${port}`);
};
authServer.listen(port, startServer);

authServer.use('/auth', authenticationRoutes);
