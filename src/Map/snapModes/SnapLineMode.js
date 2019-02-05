/* eslint-disable no-param-reassign, react/no-this-in-sfc, func-names */
import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawLine from '@mapbox/mapbox-gl-draw/src/modes/draw_line_string';
import {
    addPointToGuides,
    findGuidesFromFeatures,
    getGuideFeature,
    IDS,
    makeFeature,
    roundLngLatTo1Cm,
    shouldHideGuide,
    snap,
} from './snapUtils';

const SnapLineMode = {...DrawLine};

SnapLineMode.onSetup = function({onAdd = () => {}, properties = {}, snapFilter}) {
    const line = this.newFeature(
        makeFeature({
            type: Constants.geojsonTypes.LINE_STRING,
            properties,
        })
    );

    const verticalGuide = this.newFeature(getGuideFeature(IDS.VERTICAL_GUIDE));
    const horizontalGuide = this.newFeature(getGuideFeature(IDS.HORIZONTAL_GUIDE));

    this.addFeature(line);
    this.addFeature(verticalGuide);
    this.addFeature(horizontalGuide);
    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);

    // A dog's breakfast
    const state = {
        currentVertexPosition: 0,
        guides: findGuidesFromFeatures({map: this.map, currentFeature: line, snapFilter}),
        horizontalGuide,
        map: this.map,
        line,
        onAdd,
        snapPx: 10,
        verticalGuide,
        direction: 'forward', // expected by DrawLineString
        snapFilter,
    };

    this.map.on('moveend', () => {
        // Update the guide locations after zoom, pan, rotate, or resize
        state.guides = findGuidesFromFeatures({
            map: this.map,
            currentFeature: line,
            snapFilter,
        });
    });

    return state;
};

SnapLineMode.onClick = function(state) {
    // We save some processing by rounding on click, not mousemove
    const lng = roundLngLatTo1Cm(state.snappedLng);
    const lat = roundLngLatTo1Cm(state.snappedLat);

    // End the drawing if this click is on the previous position
    // Note: not bothering with 'direction'
    if (state.currentVertexPosition > 0) {
        const lastVertex = state.line.coordinates[state.currentVertexPosition - 1];

        if (lastVertex[0] === lng && lastVertex[1] === lat) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT);
        }
    }

    const point = state.map.project({lng, lat});

    addPointToGuides(state.guides, point);

    state.line.updateCoordinate(state.currentVertexPosition, lng, lat);

    state.currentVertexPosition++;

    state.line.updateCoordinate(state.currentVertexPosition, lng, lat);

    return null;
};

SnapLineMode.onMouseMove = function(state, e) {
    const {lng, lat} = snap(state, e);

    state.line.updateCoordinate(state.currentVertexPosition, lng, lat);
    state.snappedLng = lng;
    state.snappedLat = lat;

    this.updateUIClasses({mouse: Constants.cursors.ADD});
};

// This is 'extending' DrawLine.toDisplayFeatures
SnapLineMode.toDisplayFeatures = function(state, geojson, display) {
    if (shouldHideGuide(state, geojson)) return;

    // This relies on the the state of SnapLineMode being similar to DrawLine
    DrawLine.toDisplayFeatures(state, geojson, display);
};

// This is 'extending' DrawLine.onStop
SnapLineMode.onStop = function(state) {
    this.deleteFeature(IDS.VERTICAL_GUIDE, {silent: true});
    this.deleteFeature(IDS.HORIZONTAL_GUIDE, {silent: true});
    state.onAdd(state.line);

    // This relies on the the state of SnapLineMode being similar to DrawLine
    DrawLine.onStop.call(this, state);
};

export default SnapLineMode;
