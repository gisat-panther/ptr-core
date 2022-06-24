export const isServer =
	process && process.release && process.release.name === 'node';

const defaultOptions = {
	timeout: 10000,
};

/**
 * Returns counter of async requests.
 *
 * When request is fired, `onRequest()` should be called.
 * When request finishes, `onResponse()` should be called.
 *
 * `pendingRequests()` returns number of pending requests.
 *
 * `createReadyP()` returns promise that resolves once there are no pending requests or rejects on timeout.
 *
 * @param {Object} object
 * @param {number=} object.timeout Waiting for promise to resolve
 *
 * @returns {Object}
 */
export function createRequestCounter(options) {
	const {timeout} = Object.assign({}, defaultOptions, options);

	let v = 0;
	let p = null;
	let resolve = function () {};
	let reject = function () {};

	const modify = d => {
		v += d;
		if (v === 0) {
			p = null;
			resolve();
		}
	};

	return {
		onRequest: function () {
			modify(+1);
		},
		onResponse: function () {
			modify(-1);
		},
		pendingRequests: function () {
			return v;
		},
		/**
		 * Returns promise that resolves once there are no pending requests
		 * or rejects if internal timeout is reached.
		 */
		createReadyP: function () {
			if (p != null) {
				return p;
			}

			if (v === 0) {
				return Promise.resolve();
			}

			p = new Promise((_resolve, _reject) => {
				resolve = _resolve;
				reject = _reject;
			});

			const rejectCurrent = reject;

			// do no block indefinitely if requests are waiting too long or there is a bug somewhere
			setTimeout(() => rejectCurrent(), timeout);

			return p;
		},
	};
}

/**
 * Redux middleware that counts number of pending requests
 * by incrementing counter in `requestCounter` when such request
 * is encountered and decrementing it once it finishes.
 *
 * This can be used e.g. for SSR to know if we're done rendering
 * or we have to wait for some data.
 */
export function createAsyncMiddleware(requestCounter) {
	return function () {
		return function (next) {
			return function (action) {
				const res = next(action);
				if (res instanceof Promise) {
					requestCounter.onRequest();
					res.finally(() => requestCounter.onResponse());
				}

				return res;
			};
		};
	};
}
