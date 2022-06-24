import {renderToString} from 'react-dom/server';

const createRenderFnDefaults = {
	maxRetries: 5,
	createDataFn: el => ({
		html: renderToString(el),
	}),
};

/**
 * Returns function that repeats creating element until there are no more requests pending or if
 * `maxRetries` was exceeded.
 *
 * @param {Object} options
 * @param {number=} options.maxRetries - If number of retries is reached, current element is retrieved even if there are requests pending.
 * @param {Function=} options.createDataFn - Create data returned by render fn using react element returned by `createElFn`.
 * @param {Function} options.createElFn - Creates react element.
 * @param {Object} options.requestCounter
 *
 * @returns Function that returns `Promise` resolving to data returned by `createDataFn`.
 */
export function createRenderFn(options) {
	const {maxRetries, createDataFn, createElFn, requestCounter} = Object.assign(
		{},
		createRenderFnDefaults,
		options
	);

	let remainingRetries = maxRetries;
	const renderFn = function () {
		const el = createElFn();
		if (el == null) {
			return;
		}

		const data = createDataFn(el);

		if (remainingRetries <= 0) {
			return data; // let's not keep retrying indefinitely
		}

		if (requestCounter.pendingRequests() !== 0) {
			return requestCounter.createReadyP().then(() => {
				remainingRetries -= 1;

				return renderFn();
			});
		}

		return Promise.resolve(data);
	};

	return renderFn;
}
