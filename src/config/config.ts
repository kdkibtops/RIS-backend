import dotenv from 'dotenv';
dotenv.config();

export const setupData = {
	host: process.env.POSTGRES_HOST,
	database:
		process.env.ENV === 'Production'
			? process.env.POSTGRES_DB
			: process.env.TEST_DB,
	DB_username: process.env.POSTGRES_USER,
	DB_password: process.env.POSTGRES_PASSWORD,
	DB_port: Number(process.env.DB_port),
	server_port: Number(process.env.SERVER_PORT),
	proxy_port: Number(process.env.PROXY_SERVER_PORT),
	auth_server_port: Number(process.env.AUTH_SERVER_PORT),
	search_server_port: Number(process.env.SEARCH_SERVER_PORT),
	hashPassword: process.env.BCRYPT_PASSWORD,
	client_url: process.env.CLIENT_URL, //if testing on local computer
	// client_url: 'http://138.16.32.124', //if testing on network, use given IP address for this pc
	client_port: Number(process.env.CLIENT_PORT),
	pepper: process.env.PEPPER,
	JWT_access_secret: process.env.TOKEN_SECRET as string,
	JWT_refresh_secret: process.env.REFRESH_TOKEN_SECRET as string,
	DaylightTimeSaving: true,
};
