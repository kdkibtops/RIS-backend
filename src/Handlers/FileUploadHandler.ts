import { Request, Response, Router } from 'express';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import formidable, { errors as formidableErrors } from 'formidable';
import fs from 'fs';
import {
	deletePathFromDB,
	getOrderPatientData,
	insertPathToDB,
} from '../Models/FileUpload';

async function uploadFile(req: Request, res: Response) {
	try {
		// order_id will be either present as a param or in the request headers: order_id
		const order_id = req.params.order_id || (req.headers.order_id as string);
		console.log(req.headers.order_id);
		const { order, patient } = await getOrderPatientData(order_id);
		if (order === null || patient === null) {
			res.json({ status: 'Failed', enteries: 0, data: [] }).status(400);
			return;
		}
		console.log(`patient mrn: ${patient.mrn}`);
		console.log(`ordere id: ${order.order_id}`);
		const uploadFilePath = path.join(__dirname, '../../a_store/uploads');
		const patientRootFolderPath = path.join(uploadFilePath, `${patient.mrn}`);
		const orderRootFolderPath = path.join(
			patientRootFolderPath,
			order.order_id
		);
		console.log(orderRootFolderPath);
		if (!existsSync(orderRootFolderPath)) {
			mkdirSync(orderRootFolderPath, { recursive: true });
			console.log('order folder created');
		}
		const form = formidable({
			uploadDir: orderRootFolderPath,
			multiples: true,
			keepExtensions: true,

			filename: (name, ext, part, form) => {
				return `${name.replaceAll(' ', '_')}_${new Date()
					.toISOString()
					.replaceAll(':', '_')}${ext}`;
			},
		});
		// Function is important to parse the form and save the file
		form.parse(req, (err, fields, files) => {});
		// Function when file is saved to storage
		form.on('file', async (form, file) => {
			const pathSavedToDb = await insertPathToDB(
				'main.orders',
				'order_id',
				order_id,
				'report',
				file.filepath
			);
			res.status(200).send(file.filepath);
		});
	} catch (error) {
		console.log(`Error at uploadFile in uploadHandler: ${error}`);
		res.status(400);
	}
}

async function deleteFIle(req: Request, res: Response) {
	try {
		const order_id = req.params.order_id;
		const filePath = req.body.filePath as string;
		fs.unlinkSync(filePath);
		const result = await deletePathFromDB(
			'main.orders',
			'order_id',
			order_id,
			'report',
			filePath
		);
		console.log(result);
		res.json({ data: result }).status(200);
	} catch (error) {
		res.status(400);
	}
}

async function downloadFile(req: Request, res: Response) {
	try {
		const file = req.body.file.path;
		const parsedPath = path.parse(file);
		console.log(`Sending file: 
		directory: ${parsedPath.dir}
		base: ${parsedPath.base}`);
		const filePath = path.join(path.join(parsedPath.dir, parsedPath.base));
		res.status(200).sendFile(filePath);
	} catch (error) {
		res.status(400);
	}
}

async function openFile(req: Request, res: Response) {
	try {
		const filePath = req.params.filePath;
		if (filePath === 'frf') {
			res.download(
				'E:/My_projects/RadAssist/Backend/a_store/uploads/123/123/Intervention_clinic_2023-04-23T21_07_27.764Z.pdf'
			);
		}
		console.log(filePath);
	} catch (error) {}
}

const filesHandler = Router();

filesHandler.post('/upload/:order_id', uploadFile);
filesHandler.post('/upload', uploadFile);
filesHandler.post('/open', downloadFile);
filesHandler.get('/open/:filePath', openFile);
filesHandler.post('/delete/:order_id', deleteFIle);

export default filesHandler;
