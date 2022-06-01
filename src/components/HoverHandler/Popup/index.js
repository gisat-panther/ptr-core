import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {getTootlipPosition} from '../position';
import classnames from 'classnames';

import './style.scss';

const WIDTH = 250;
const HEIGHT = 50;
const TOOLTIP_PADDING = 15;

const getTooltipStyle = () => {
	// bbox for tooltip default defined by window
	const windowScrollTop = window.document.documentElement.scrollTop;
	const windowScrollLeft = window.document.documentElement.scrollLeft;
	const windowHeight = window.document.documentElement.clientHeight;
	const windowWidth = window.document.documentElement.clientWidth;
	const windowBBox = [
		windowScrollTop,
		windowScrollLeft + windowWidth,
		windowScrollTop + windowHeight,
		windowScrollLeft,
	];

	return getTootlipPosition(
		'corner',
		['right', 'left', 'top', 'bottom'],
		windowBBox,
		TOOLTIP_PADDING
	);
};

const Popup = ({
	x,
	y,
	content,
	getStyle,
	hoveredElemen,
	compressed,
	children,
}) => {
	const ref = useRef();

	const getStyleSelf = () => {
		let posX = x;
		let posY = y;
		let maxX = window.innerWidth;
		let maxY = window.innerHeight + window.pageYOffset;
		let minY = window.pageYOffset;
		const maxWidth = maxX - 20;
		const maxHeight = maxY - minY - 20;

		const element = ref.current && ref.current.children[0];
		let width = element && element.offsetWidth ? element.offsetWidth : WIDTH;
		let height =
			element && element.offsetHeight ? element.offsetHeight : HEIGHT;

		let style = null;

		if (typeof getStyle === 'function' && hoveredElemen) {
			style = getStyle()(posX, posY, width, height, hoveredElemen);
		} else {
			//right corner on mouse position
			style = getTooltipStyle()(posX, posY, width, height);
		}

		if (compressed || height > maxHeight) {
			width = 500;
		}

		if (width > maxWidth) {
			width = maxWidth;
		}
		return style;
	};

	useEffect(() => {
		// autofocus the input on mount
		if (true && ref && ref.current) {
			const style = getStyleSelf();
			ref.current.style = style;
		}
	}, []);

	const style = getStyleSelf();

	let classes = classnames('ptr-popup', {
		compressed: compressed,
	});

	if (ref && !ref.current) {
		style.display = 'none';
	}

	return (
		<div ref={ref}>
			<div style={style} className={classes}>
				{content ? React.cloneElement(content) : children}
			</div>
		</div>
	);
};

Popup.propTypes = {
	children: PropTypes.node,
	x: PropTypes.number,
	y: PropTypes.number,
	maxX: PropTypes.number,
	content: PropTypes.element,
	getStyle: PropTypes.func,
	hoveredElemen: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
	compressed: PropTypes.bool,
};

export default Popup;
