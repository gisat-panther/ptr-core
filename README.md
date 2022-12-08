[![N|Solid](https://img.shields.io/badge/created%20by-GISAT-green)](https://gisat.cz/)
# **Welcome to Panther framework**
Panther framework is developed by GISAT s.r.o and used to create dynamic web applications with interactive maps and charts.

## Getting started

#### Installation
**ptr-core** is a heart of the framework. To get started, install the core using node package manager
```
npm i -D @gisatcz/ptr-core
```

#### Importing core styles
Styles are presented in css and scss fromat. To import core Panther styles to the new project simply use:

```js
import '@gisatcz/ptr-core/lib/styles/reset.css';
import '@gisatcz/ptr-core/lib/styles/base.scss';
```


## Server Side Rendering

To use SSR, include into src/index.jsx isServer component with ReactDOM

```js
import ReactDOM from 'react-dom';
import {isServer} from '@gisatcz/ptr-core';
```

Example of use:

```js
import {isServer} from '@gisatcz/ptr-core';

function renderApp() {
	const rootEl = document.getElementById('root');
	const render =
		isServer || rootEl.hasChildNodes() ? ReactDOM.hydrate : ReactDOM.render;
	render(<ConnectedApp />, rootEl);
}

renderApp();
```

#### Configuration
Create a configuration file src/config/index.js with the following content

```js
import {config} from '@gisatcz/ptr-core';
/**
 * APP SPECIFIC DEFAULT VALUES
 */
import appDefaults from './appDefaults';
export default config(appDefaults);
```
and src/config/appDefaults.js
```
export default {
	apiBackendPath: '',
	timeSerieDataUrl: '/static/data/',
};
```
Where ConnectedApp is the application


### Api

```js
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
createRenderFn({
	maxRetries,
	createDataFn,
	createElFn,
	requestCounter,
});

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
createRequestCounter(options);

/**
 * Redux middleware that counts number of pending requests
 * by incrementing counter in `requestCounter` when such request
 * is encountered and decrementing it once it finishes.
 *
 * This can be used e.g. for SSR to know if we're done rendering
 * or we have to wait for some data.
 */
createAsyncMiddleware(requestCounter);
```

### Demo

```js
import {createStore} from 'redux';
import {
	createRenderFn,
	createRequestCounter,
	createAsyncMiddleware,
} from '@gisatcz/ptr-core';

function createStore() {
	const requestCounter = createRequestCounter();

	const store = createStore(reducer, {}, createAsyncMiddleware(requestCounter));

	return {
		store,
		requestCounter,
	};
}

function handler(req, res) {
	const {store, requestCounter} = createStore();

	const createEl = () => {
		/* Element returned for further processing.
		 * If in react we fire some requests, this `createEl` function will be called again
		 * thanks to `createAsyncMiddleware` that tracks requests using `requestCounter`.
		 */
		const appEl = (
			<UIDReset>
				<Provider store={store}>
					<App />
				</Provider>
			</UIDReset>
		);

		if (shouldRedirect) {
			/* If we decide somewhere in react that we want to redirect user, we can
			 * just do that and return `nil` instead of the element.
			 */
			res.redirect(301, requiredUrl);
			return;
		}

		return appEl;
	};

	const renderFn = createRenderFn({requestCounter, createEl});

	/* Here we just return promise of data that's gonna be send to client
	 * using `cra-universal` npm package (unless `createEl` returns `nil` in which case we
	 * handled sending data to client already)
	 */
	return requestCounter.createReadyP().then(() => renderFn());
}
```

