import configDefaults from './defaults';

import {each as _each, keys as _keys, merge as _merge} from 'lodash';

export default appDefaults => {
	/**
	 * Parse configuration values from env
	 */
	let env = {};
	_each(_keys(_merge({}, configDefaults, appDefaults)), property => {
		if (Object.hasOwn(process.env, `REACT_APP_${property}`)) {
			env[property] = process.env[`REACT_APP_${property}`];
		}
	});

	/**
	 * Use configuration values from external runtime configuration file
	 */
	let runtimeConfig = {};
	if (typeof window !== 'undefined' && Object.hasOwn(window, 'runtimeConfig')) {
		runtimeConfig = window.runtimeConfig;
	}

	/**
	 * Use configuration values prepared by SSR
	 */
	let preloadedStateConfig = {};
	if (
		typeof window !== 'undefined' &&
		Object.hasOwn(window, '__PRELOADED_STATE__') &&
		Object.hasOwn(window.__PRELOADED_STATE__, 'app') &&
		Object.hasOwn(window.__PRELOADED_STATE__.app, 'localConfiguration')
	) {
		preloadedStateConfig = window.__PRELOADED_STATE__.app.localConfiguration;
	}

	return _merge(
		{},
		configDefaults,
		appDefaults,
		env,
		runtimeConfig,
		preloadedStateConfig
	);
};
