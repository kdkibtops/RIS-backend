/**Function to return the date in Egypt
 * @param {boolean} DaylightTimeSaving: if true TimeZone will be set to GMT +3 , if false, EMGT +2
 * @returns {string} current Date & Time
 */

import { setupData } from './config';

export function getDateInEgypt(): string {
	if (setupData.DaylightTimeSaving) {
		return new Date(
			new Date().toLocaleString('en-US', { timeZone: 'ETc/GMT-5' })
		)
			.toISOString()
			.split('.')[0];
	} else {
		return new Date(
			new Date().toLocaleString('en-US', { timeZone: 'ETc/GMT-4' })
		)
			.toISOString()
			.split('.')[0];
	}
}
