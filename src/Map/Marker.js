import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const Marker = props => (
    <div style={{color: '#725038', textShadow: '0 0 3px white'}}>{props.text}</div>
);

Marker.propTypes = {
    iconUrl: PropTypes.string,
    text: PropTypes.string.isRequired,
};

export const makeMarkerElement = ({iconUrl, text}) => {
    const el = document.createElement('div');

    ReactDOM.render(<Marker iconUrl={iconUrl} text={text} />, el);

    return el;
};

export default Marker;
