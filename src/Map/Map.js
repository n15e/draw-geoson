import React from 'react';
import * as PropTypes from 'prop-types';
import mapboxGl from 'mapbox-gl';
import ImageLayer from './ImageLayer/ImageLayer';
import {round} from './snapModes/snapUtils';
import * as mapUtils from './mapUtils';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxGl.accessToken =
    'pk.eyJ1IjoiZGF2aWRnNzA3IiwiYSI6ImNqZWVxaGtnazF2czAyeXFlcDlvY2kwZDQifQ.WSmiQO0ccl85_FvEDTsBmw';

class Map extends React.PureComponent {
    componentDidUpdate(prevProps) {
        if (this.props.rotation !== prevProps.rotation) {
            this.map.setBearing(this.props.rotation);
        }
    }

    componentDidMount() {
        this.map = mapUtils.initMap('mapbox-snap-map');

        this.map.on('load', () => {
            // Tell the parent component the map is ready
            this.props.onMapReady({
                rotation: round(this.map.getBearing(), 1), // potentially set from the URL
            });
        });

        this.map.on('rotate', () => {
            const bearing = round(this.map.getBearing(), 1);

            if (bearing !== this.props.rotation) {
                this.props.onRotationChange(Math.round(bearing * 1000) / 1000);
            }
        });
    }

    render() {
        return (
            <div className={this.props.className}>
                <div id="mapbox-snap-map" style={{height: '100%'}} />

                {!!this.props.imageLayer && <ImageLayer {...this.props.imageLayer} />}
            </div>
        );
    }
}

Map.propTypes = {
    className: PropTypes.string.isRequired,
    imageLayer: PropTypes.object,
    onMapReady: PropTypes.func.isRequired,
    onRotationChange: PropTypes.func.isRequired,
    rotation: PropTypes.number.isRequired,
};

export default Map;
