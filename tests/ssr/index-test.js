import {describe, it} from 'mocha';
import {assert} from 'chai';
import * as ssr from '../../src/ssr/index';

/**
 * Returns promise with methods `resolve`, `reject` that can be used to resolve/reject the promise.
 * Both methods return the promise.
 */
function promise() {
	let _resolve;
	let _reject;
	const p = new Promise((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});
	p.resolve = value => {
		_resolve(value);

		return p;
	};
	p.reject = reason => {
		_reject(reason);

		return p;
	};

	return p;
}

describe('ssr/index', function () {
	describe('createRequestCounter', function () {
		it('no requests', function (done) {
			const requestCounter = ssr.createRequestCounter();
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			requestCounter.createReadyP().then(() => done());
		});

		it('some requests', function (done) {
			const requestCounter = ssr.createRequestCounter();
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			requestCounter.onRequest();
			assert.strictEqual(requestCounter.pendingRequests(), 1);

			requestCounter.createReadyP().then(() => done());

			requestCounter.onRequest();
			assert.strictEqual(requestCounter.pendingRequests(), 2);

			requestCounter.onResponse();
			assert.strictEqual(requestCounter.pendingRequests(), 1);
			requestCounter.onResponse();
			assert.strictEqual(requestCounter.pendingRequests(), 0);
		});

		it('timeout', function (done) {
			const requestCounter = ssr.createRequestCounter({timeout: 100});
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			requestCounter.onRequest();
			assert.strictEqual(requestCounter.pendingRequests(), 1);

			requestCounter.createReadyP().catch(() => done());
		});
	});

	describe('createAsyncMiddleware', function () {
		const store = null;

		const next = action => action;

		it('no requests', function (done) {
			const requestCounter = ssr.createRequestCounter();
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			requestCounter.createReadyP().then(() => done());
		});

		it('some requests', function (done) {
			const requestCounter = ssr.createRequestCounter();
			const dispatch = ssr.createAsyncMiddleware(requestCounter)(store)(next);
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			assert.deepStrictEqual(dispatch({type: 'something'}), {
				type: 'something',
			});
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			const p1 = promise();
			dispatch(p1);
			assert.strictEqual(requestCounter.pendingRequests(), 1);

			requestCounter.createReadyP().then(() => done());

			const p2 = promise();
			dispatch(p2);
			assert.strictEqual(requestCounter.pendingRequests(), 2);

			p1.resolve()
				.then(() => assert.strictEqual(requestCounter.pendingRequests(), 1))
				.then(() => p2.resolve())
				.then(() => assert.strictEqual(requestCounter.pendingRequests(), 0));
		});

		it('timeout', function (done) {
			const requestCounter = ssr.createRequestCounter({timeout: 100});
			const dispatch = ssr.createAsyncMiddleware(requestCounter)(store)(next);
			assert.strictEqual(requestCounter.pendingRequests(), 0);

			const p = promise();
			dispatch(p);
			assert.strictEqual(requestCounter.pendingRequests(), 1);

			requestCounter.createReadyP().catch(() => done());
		});
	});

	describe('isServer', function () {
		it('returns true as tests run on node', () => {
			assert.isTrue(ssr.isServer);
		});
	});
});
