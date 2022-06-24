import React, {useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Popup from './Popup';

import Context from '@gisatcz/cross-package-react-context';
const HoverContext = Context.getContext('HoverContext');

const HoverHandler = ({
	popupContentComponent,
	compressedPopups,
	selectedItems,
	children,
}) => {
	const [state, setState] = useState({
		hoveredItems: [],
		popupContent: null,
		x: null,
		y: null,
		data: null,
	});

	const onHoverOut = () => {
		setState({
			hoveredItems: [],
			popupContent: null,
			data: null,
			fidColumnName: null,
		});
	};

	const onHover = (hoveredItems, options) => {
		// TODO what is wrong with attributes? Just bad signal? Else try single layer

		// TODO check popup coordinates -> if the same -> merge data / else -> overwrite
		// TODO if empty hovered items && nothing in state -> set state with nulls

		let update = {};
		let coordChanged = false;

		// for older versions compatibility
		if (options && options.popup && options.popup.content) {
			update.popupContent = options.popup.content;
		}

		// check if coordinates has been changed
		if (options && options.popup && options.popup.x && options.popup.y) {
			if (state.x !== options.popup.x || state.y !== options.popup.y) {
				coordChanged = true;
				update.x = options.popup.x;
				update.y = options.popup.y;
			}
		}

		// handle data according to coordinates change
		// TODO fid column name should be part of data
		if (coordChanged) {
			update.hoveredItems = hoveredItems;
			update.data = options.popup.data;
			update.fidColumnName = options.popup.fidColumnName;
		} else {
			update.hoveredItems = [...state.hoveredItems, ...hoveredItems];
			if (
				options &&
				options.popup &&
				options.popup.data &&
				options.popup.data.length
			) {
				update.data = [...state.data, ...options.popup.data];
				update.fidColumnName = options.popup.fidColumnName;
			}
		}

		if (!_.isEmpty(update)) {
			if (update.hoveredItems && update.hoveredItems.length) {
				setState(update);
			} else {
				onHoverOut();
			}
		}
	};

	const renderPopupContent = () => {
		const comp = popupContentComponent;
		if (React.isValidElement(comp)) {
			return React.cloneElement(comp, {
				data: state.data,
				featureKeys: state.hoveredItems,
				fidColumnName: state.fidColumnName,
			});
		} else {
			return React.createElement(comp, {
				data: state.data,
				featureKeys: state.hoveredItems,
				fidColumnName: state.fidColumnName,
			});
		}
	};

	const renderPopup = () => {
		return (
			<Popup
				x={state.x}
				y={state.y}
				content={
					popupContentComponent ? renderPopupContent() : state.popupContent
				}
				compressed={compressedPopups}
			/>
		);
	};

	return (
		<HoverContext.Provider
			value={{
				hoveredItems: state.hoveredItems,
				selectedItems: selectedItems,
				onHover: onHover,
				onHoverOut: onHoverOut,
				x: state.x,
				y: state.y,
			}}
		>
			{children}
			{state.popupContent || state.data ? renderPopup() : null}
		</HoverContext.Provider>
	);
};

HoverHandler.propTypes = {
	children: PropTypes.node,
	selectedItems: PropTypes.array,
	compressedPopups: PropTypes.bool,
	popupContentComponent: PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.func,
	]),
};

export default HoverHandler;
