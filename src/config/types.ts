import { Order } from '../Models/Orders';
import { Patient } from '../Models/Patients';
import { Study } from '../Models/Studies';
import { User } from '../Models/Users';

export type AuthenticationReqBody = {
	username?: string;
	user_password?: string;
	JWT?: string;
	authenticated?: {
		status: boolean;
		full_name: string | null;
	};
	timestamp?: string;
};
export type RegisterationReqBody = {
	username: string;
	user_password: string;
	full_name: string;
	mail: string;
	user_id: string;
	job: string;
	user_role: string;
	created?: string;
};
export type QueryObject = {
	schema: string;
	tableName: string;
	filterColumn: string;
	filterValue: string;
};
export type REQBODY = {
	orders: Order;
	users: User;
	patients: Patient;
	studies: Study;
	query: QueryObject;
};
