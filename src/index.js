import configDefaults from './config/defaults';
import config from './config';
import HoverHandler from './components/HoverHandler';
import mapConstants from './constants/Map';
import Popup from './components/HoverHandler/Popup';
import distinctColours from './distinctColours';
import FaroAnalytics from './faro';

import './styles/base.scss';

// TODO move somewhere else
import {getTootlipPosition} from './components/HoverHandler/position';

export * from './ssr/index';
export * from './ssr/server';

export {
	configDefaults,
	config,
	distinctColours,
	HoverHandler,
	mapConstants,
	Popup,
	getTootlipPosition,
	FaroAnalytics,
};
