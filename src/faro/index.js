import {initializeFaro, LogLevel} from '@grafana/faro-web-sdk';

/**
 *
 */
class FaroAnalytics {
	// The instance variable that holds the single instance of the class
	static instance = null;

	// Private constructor to prevent direct instantiation
	constructor() {
		if (FaroAnalytics.instance) {
			throw new Error(
				'Use this.getInstance() to get an instance of this class.'
			);
		}
	}

	/**
	 *
	 * @param {string} initialData.url grafana url
	 * @param {Object} initialData.app App name, enviroment and version
	 * @returns
	 */
	init(initialData) {
		if (!FaroAnalytics.instance) {
			FaroAnalytics.instance = initializeFaro({
				url: initialData.url,
				app: {
					name: initialData?.app?.name,
					version: initialData?.app?.version,
					enviroment: initialData?.app?.enviroment,
				},
			});
		}
		return FaroAnalytics.instance;
	}

	log(message, level) {
		if (FaroAnalytics.instance) {
			FaroAnalytics.instance.api.pushLog([...message], {
				...(level ? {level} : {level: LogLevel.Debug}),
			});
		} else {
			throw new Error(
				'Faro instance is not initialized. Initialize Faro instance first.'
			);
		}
	}
}

export default new FaroAnalytics();
