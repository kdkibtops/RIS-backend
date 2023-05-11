import { UID_Columns } from '../config/LocalConfiguration';

// Still developing a logic to insert the array fields
// this logic is partially successful but need debugging

export function createSQLinsert(
	tableName: string,
	columnsName: string[],
	entries: (string | number | JSON | boolean)[]
): string {
	let columns = ``;
	columnsName.forEach((element) => {
		columns += element;
		columns += ',';
	});
	let UID: string = '';
	UID_Columns.map((U) => {
		columnsName.forEach((col) => {
			if (col === U) {
				UID = U;
			}
		});
	});
	const UIDIndex = columnsName.findIndex((col) => col === UID);
	// const arrayColumnsIndex: number[] = [];
	// columnsName.forEach((col, ind) => {
	// 	if (arrayColumns.includes(col)) {
	// 		arrayColumnsIndex.push(ind);
	// 	}
	// });
	let values = '';
	entries.forEach((element, index) => {
		if (index === UIDIndex) {
			values += `'${(element as string).toLowerCase()}'`;
			values += ',';
			// } else if (arrayColumnsIndex.includes(index)) {
			// 	values += `ARRAY['${element}']`;
			// 	values += ',';
		} else {
			values += `'${element}'`;
			values += ',';
		}
	});
	columns = columns.slice(0, -1);
	values = values.slice(0, -1);
	let SQL = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING *;`;
	return SQL;
}

export function createSQLupdate(
	tableName: string,
	columnsName: string[],
	entries: (string | number | JSON | boolean)[],
	filterColumn: string,
	filterValue: string | number
): string {
	const x = columnsName
		.map((col: unknown, i) => {
			if (col !== filterColumn) {
				return { [col as string]: entries[i] };
			}
		})
		.filter((x) => x);
	// const arrayColumnsIndex: number[] = [];
	// columnsName.forEach((col, ind) => {
	// 	if (arrayColumns.includes(col)) {
	// 		arrayColumnsIndex.push(ind);
	// 	}
	// });
	let SQL: string = '';
	SQL = `UPDATE ${tableName} SET `;
	columnsName.forEach((column, index) => {
		if (index === 0) {
			// if (arrayColumnsIndex.includes(index)) {
			// 	SQL += `,${column}= array_append(${column}, '${entries[index]}')`;
			// } else {
			// }
			SQL += `${column} = '${
				typeof entries[index] === 'string'
					? (entries[index] as string)
					: entries[index]
			}'`;
		} else {
			// if (arrayColumnsIndex.includes(index)) {
			// 	SQL += `,${column}= array_append(${column}, '${entries[index]}')`;
			// } else {
			// }
			SQL += `,${column} = '${
				typeof entries[index] === 'string'
					? (entries[index] as string)
					: entries[index]
			}'`;
		}
	});

	//   console.log(SQL);

	SQL += ` WHERE ${filterColumn} = '${
		typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue
	}' RETURNING *`;
	return SQL;
}

export function createSQLdelete(
	tableName: string,
	filterColumn: string,
	filterValue: string
): string {
	let SQL = `DELETE FROM ${tableName} WHERE ${filterColumn} = '${
		typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue
	}' RETURNING *`;
	return SQL;
}

/**
 * @param {string[]} columnsNeeded: if you want all columns enter '*' instead of columnsNeeded
 * @param {[string, unknown]}filter: if you want to add filter, add array [filterColumn, filterValue] to optional param filter
 * @param {string[]} asColumnsName: if you want columns name to be changed enter the required values in order as optional argument asColumnName,
 * But if you used optinal argument asColumnName, number of columns in both arguments must be equal
 * */
export function createSQLshowAll(
	tableName: string,
	columnsNeeded: string[],
	filter?: string[],
	asColumnsName?: string[]
): string {
	let columns = ``;
	let SQL = ``;
	if (asColumnsName) {
		let i = 0;
		columnsNeeded.forEach((element) => {
			columns += element + ' AS ';
			columns += asColumnsName[i];
			i++;
			columns += ',';
		});
		columns = columns.slice(0, -1);
		SQL = `SELECT ${columns} FROM ${tableName}`;
	} else {
		columnsNeeded.forEach((element) => {
			columns += element;
			columns += ',';
		});
		columns = columns.slice(0, -1);
		// if no columns needed provided, by default it will return everything *
		if (columnsNeeded.length === 0) {
			columns += '*';
		}
		SQL = `SELECT ${columns} FROM ${tableName}`;
	}
	if (typeof filter !== 'undefined') {
		SQL += ` WHERE ${filter[0]}= '${filter[1]}'`;
	}
	console.log(SQL);
	return SQL;
}

// if you want all columns enter '*' instead of columnsNeeded
// if you want columns name to be changes enter the required values in order as optional argument asColumnName
// But if you used optinal argument asColumnName, number of columns in both arguments must be equal
export function createSQLshowOneOnly(
	tableName: string,
	filterColumn: string,
	filterValue: string | number,
	columnsNeeded: string[],
	orderBy: string,
	asColumnsName?: string[]
): string {
	let columns = ``;
	let SQL = ``;
	if (asColumnsName) {
		let i = 0;
		columnsNeeded.forEach((element) => {
			columns += element + ' AS ';
			columns += asColumnsName[i];
			i++;
			columns += ',';
		});
		columns = columns.slice(0, -1);
		SQL = `SELECT ${columns} FROM ${tableName}`;
	} else {
		columnsNeeded.forEach((element) => {
			columns += element;
			columns += ',';
		});
		columns = columns.slice(0, -1);
		if (columnsNeeded.length === 0) {
			columns = '*';
		}
		SQL = `SELECT ${columns} FROM ${tableName}`;
	}
	SQL += ` WHERE ${filterColumn}='${
		typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue
	}' `;
	SQL += `ORDER BY ${orderBy} DESC LIMIT 1;`;
	console.log(SQL);
	return SQL;
}
