// eslint-disable-next-line no-unused-vars
import React, {cloneElement, useState, useLayoutEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {getTootlipPosition} from '../position';
import classnames from 'classnames';

import './style.scss';

const WIDTH = 250;
const HEIGHT = 0;
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

	const heightRef = useRef();
	const [tooltipHeight, setTooltipHeight] = useState(0);

	useLayoutEffect(() => {
		heightRef.current = ref?.current?.offsetHeight;
		if (ref?.current?.offsetHeight !== tooltipHeight) {
			setTooltipHeight(ref?.current?.offsetHeight);
		}
	}, [content]);

	const getPopupStyle = () => {
		let posX = x;
		let posY = y;
		let maxX = window.innerWidth;
		let maxY = window.innerHeight + window.pageYOffset;
		let minY = window.pageYOffset;
		const maxWidth = maxX - 20;
		const maxHeight = maxY - minY - 20;

		const element = ref.current;
		let width = element?.offsetWidth || WIDTH;
		const height = tooltipHeight || HEIGHT;

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
		return element && element.offsetWidth !== 0 && element.offsetHeight !== 0
			? {...style}
			: {
					...style,
					position: 'absolute',
					overfloat: 'auto',
			  };
	};

	// Is it needed???
	// componentDidMount() {
	// 	if (true && ref && ref.current) {
	// 		const style = getPopupStyle();
	// 		ref.current.style = style;
	// 	}
	// }

	const style = getPopupStyle();

	let classes = classnames('ptr-popup', {
		compressed: compressed,
	});

	if (ref && !ref.current) {
		// FIXME - test
		// commented for world water use in chart
		style.display = 'none';
	}

	return (
		<div ref={ref} style={{...style}} className={classes}>
			{content ? cloneElement(content) : children}
		</div>
	);
};

Popup.propTypes = {
	children: PropTypes.node,
	compressed: PropTypes.bool,
	content: PropTypes.element,
	getStyle: PropTypes.func,
	hoveredElemen: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
	x: PropTypes.number,
	y: PropTypes.number,
};

export default Popup;
