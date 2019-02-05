/* eslint-disable no-param-reassign, react/no-this-in-sfc, func-names */
import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
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

const SnapPolygonMode = {...DrawPolygon};

SnapPolygonMode.onSetup = function({onAdd, properties = {}}) {
    const polygon = this.newFeature(
        makeFeature({
            type: Constants.geojsonTypes.POLYGON,
            properties,
        })
    );

    const verticalGuide = this.newFeature(getGuideFeature(IDS.VERTICAL_GUIDE));
    const horizontalGuide = this.newFeature(getGuideFeature(IDS.HORIZONTAL_GUIDE));

    this.addFeature(polygon);
    this.addFeature(verticalGuide);
    this.addFeature(horizontalGuide);
    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);

    // A dog's breakfast
    const state = {
        currentVertexPosition: 0,
        guides: findGuidesFromFeatures({
            map: this.map,
            currentFeature: polygon,
        }),
        horizontalGuide,
        map: this.map,
        polygon,
        snapPx: 10,
        verticalGuide,
        onAdd: onAdd || (() => {}),
    };

    this.map.on('moveend', () => {
        // Update the guide locations after zoom, pan, rotate, or resize
        state.guides = findGuidesFromFeatures({map: this.map, currentFeature: polygon});
    });

    return state;
};

SnapPolygonMode.onClick = function(state) {
    // We save some processing by rounding on click, not mousemove
    const lng = roundLngLatTo1Cm(state.snappedLng);
    const lat = roundLngLatTo1Cm(state.snappedLat);

    // End the drawing if this click is on the previous position
    if (state.currentVertexPosition > 0) {
        const lastVertex = state.polygon.coordinates[0][state.currentVertexPosition - 1];

        if (lastVertex[0] === lng && lastVertex[1] === lat) {
            return this.changeMode(Constants.modes.SIMPLE_SELECT);
        }
    }

    const point = state.map.project({lng, lat});

    addPointToGuides(state.guides, point);

    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);

    state.currentVertexPosition++;

    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);

    return null;
};

SnapPolygonMode.onMouseMove = function(state, e) {
    const {lng, lat} = snap(state, e);

    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
    state.snappedLng = lng;
    state.snappedLat = lat;

    this.updateUIClasses({mouse: Constants.cursors.ADD});
};

// This is 'extending' DrawPolygon.toDisplayFeatures
SnapPolygonMode.toDisplayFeatures = function(state, geojson, display) {
    if (shouldHideGuide(state, geojson)) return;

    // This relies on the the state of SnapPolygonMode being similar to DrawPolygon
    DrawPolygon.toDisplayFeatures(state, geojson, display);
};

// This is 'extending' DrawPolygon.onStop
SnapPolygonMode.onStop = function(state) {
    this.deleteFeature(IDS.VERTICAL_GUIDE, {silent: true});
    this.deleteFeature(IDS.HORIZONTAL_GUIDE, {silent: true});

    if (state.polygon && state.polygon.coordinates.length > 2) {
        state.onAdd(state.polygon);
    }

    // This relies on the the state of SnapPolygonMode being similar to DrawPolygon
    DrawPolygon.onStop.call(this, state);
};

export default SnapPolygonMode;
