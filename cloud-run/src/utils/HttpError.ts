import { Response, Request } from 'express';
// import * as Sentry from '@sentry/node';
import { HttpStatusCode } from './HttpStatusCodes';
import { ApiUtility } from './ApiUtility';

export class HttpError extends Error {
	errorCode: HttpStatusCode;
	errorInfo: { message: string; objects?: Array<any> | Record<string, string> } | null;

	constructor(
		errorCode: HttpStatusCode,
		m: string | null,
		errorInfo: { message: string; objects?: Array<any> | Record<string, string> } | null = null
	) {
		super(m ?? '');
		this.errorCode = errorCode;
		this.errorInfo = errorInfo;
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, HttpError.prototype);
	}

	sendResponse(res: Response) {
		return res.status(this.errorCode).send({ message: this.message });
	}
}

export async function sendErrorResponse(err: Error, req: Request, res: Response, defaultMsg: string | null = null) {
	ApiUtility.logInfo(req, `Action by User Id:${req.user?.uid} , Company Id: ${req.params?.companyId}`);
	const errorMessage = (err instanceof HttpError && err?.errorInfo?.message) || err?.message || defaultMsg || 'Error occurred';
	if (!ApiUtility.isDev()) {
        // DEV NOTE : try to use a free tool like sentry
		// Sentry.captureException(err, {
		// 	extra: {
		// 		message: errorMessage,
		// 		objects: err instanceof HttpError && err.errorInfo?.objects ? JSON.stringify(err.errorInfo.objects) : null
		// 	}
		// });
	} else {
		// ApiUtility.logInfo(req, `Push error to slack: ${JSON.stringify({ err: err, message: errorMessage })}`, { err: err, message: errorMessage });
		// try {
		// 	await ApiUtility.pushErrorToSlack(err, errorMessage);
		// } catch (err) {
		// 	ApiUtility.logError(req, 'Error in pushing error to slack', err);
		// }
	}
	if (err instanceof HttpError) {
		ApiUtility.logError(req, err?.errorInfo?.message ?? err?.message ?? 'Error occurred', err, err.errorInfo?.objects);
		err.sendResponse(res);
	} else {
		ApiUtility.logError(req, err?.message ?? 'Error occurred', err);
		res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send({ message: defaultMsg ?? err?.message ?? 'An unknown error occurred' });
	}
}
