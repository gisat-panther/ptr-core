import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import multi from '@rollup/plugin-multi-entry';

const env = process.env.NODE_ENV;

const lodashExternal = ['lodash/isEmpty'];

export default {
	input: 'tests/**/*-test.js',
	external: [
		'react',
		'react-helmet',
		'react-dom/server',
		'prop-types',
		'classnames',
		'chai',
		...lodashExternal,
	],
	output: {
		file: 'build/bundle-tests.js',
		format: env,
		globals: {
			// 'lodash/random': '_.random'
		},
		exports: 'named' /** Disable warning for default imports */,
		sourcemap: true,
	},
	plugins: [
		multi(),
		babel({
			plugins: ['lodash'],
			babelHelpers: 'bundled'
		}),
		commonjs({
			include: 'node_modules/**',
		}),
	],
};
