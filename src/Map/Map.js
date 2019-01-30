import React from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import ImageLayer from './ImageLayer/ImageLayer';
import SnapPolygonMode from './snapModes/SnapPolygonMode';
import SnapPointMode from './snapModes/SnapPointMode';
import SnapLineMode from './snapModes/SnapLineMode';
import customDrawStyles from './customDrawStyles';
import {round} from './snapModes/snapUtils';
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
        this.map = new mapboxGl.Map({
            container: 'mapbox-snap-map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-73.979582, 40.764116],
            zoom: 14.5,
            hash: true,
            pitchWithRotate: false,
        });

        this.draw = new MapboxDraw({
            modes: {
                ...MapboxDraw.modes,
                snap_point: SnapPointMode,
                snap_polygon: SnapPolygonMode,
                snap_line: SnapLineMode,
            },
            styles: customDrawStyles,
            userProperties: true,
        });

        this.map.addControl(this.draw, 'bottom-left');

        window.map = this.map;

        this.map.on('load', () => {
            this.props.onMapReady({
                map: this.map,
                draw: this.draw,
                rotation: round(this.map.getBearing(), 1), // potentially set from the URL
            });
        });

        this.map.on('rotate', () => {
            const bearing = round(this.map.getBearing(), 1);

            if (bearing !== this.props.rotation) {
                this.props.onRotationChange(Math.round(bearing * 1000) / 1000);
            }
        });

        this.map.on('draw.selectionchange', ({features}) => {
            if (features.length !== 1) {
                this.props.setCurrentFeature(null);
            } else {
                this.props.setCurrentFeature(features[0].id);
            }
        });
    }

    render() {
        return (
            <div className={this.props.className}>
                <div id="mapbox-snap-map" style={{height: '100%'}} />

                {!!this.props.imageLayer && (
                    <ImageLayer {...this.props.imageLayer} map={this.map} />
                )}
            </div>
        );
    }
}

export default Map;
