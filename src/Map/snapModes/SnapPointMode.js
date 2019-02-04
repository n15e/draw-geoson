/* eslint-disable no-param-reassign, react/no-this-in-sfc, func-names */
import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPoint from '@mapbox/mapbox-gl-draw/src/modes/draw_point';
import {
    findGuidesFromFeatures,
    getGuideFeature,
    IDS,
    makeFeature,
    roundLngLatTo1Cm,
    shouldHideGuide,
    snap,
} from './snapUtils';

const SnapPointMode = {...DrawPoint};

SnapPointMode.onSetup = function({draw, properties = {}}) {
    const point = this.newFeature(
        makeFeature({
            type: Constants.geojsonTypes.POINT,
            properties,
        })
    );

    const verticalGuide = this.newFeature(getGuideFeature(IDS.VERTICAL_GUIDE));
    const horizontalGuide = this.newFeature(getGuideFeature(IDS.HORIZONTAL_GUIDE));

    this.addFeature(point);
    this.addFeature(verticalGuide);
    this.addFeature(horizontalGuide);
    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);

    // A dog's breakfast
    const state = {
        draw,
        guides: findGuidesFromFeatures({map: this.map, draw, currentFeature: point}),
        horizontalGuide,
        map: this.map,
        point,
        snapPx: 10,
        verticalGuide,
    };

    this.map.on('moveend', () => {
        // Update the guide locations after zoom, pan, rotate, or resize
        state.guides = findGuidesFromFeatures({map: this.map, draw, currentFeature: point});
    });

    return state;
};

SnapPointMode.onClick = function(state) {
    // We mock out e with the rounded lng/lat then call DrawPoint with it
    DrawPoint.onClick.call(this, state, {
        lngLat: {
            lng: roundLngLatTo1Cm(state.snappedLng),
            lat: roundLngLatTo1Cm(state.snappedLat),
        },
    });
};

SnapPointMode.onMouseMove = function(state, e) {
    const {lng, lat} = snap(state, e);

    state.snappedLng = lng;
    state.snappedLat = lat;

    this.updateUIClasses({mouse: Constants.cursors.ADD});
};

// This is 'extending' DrawPoint.toDisplayFeatures
SnapPointMode.toDisplayFeatures = function(state, geojson, display) {
    if (shouldHideGuide(state, geojson)) return;

    // This relies on the the state of SnapPointMode having a 'point' prop
    DrawPoint.toDisplayFeatures(state, geojson, display);
};

// This is 'extending' DrawPoint.onStop
SnapPointMode.onStop = function(state) {
    this.deleteFeature(IDS.VERTICAL_GUIDE, {silent: true});
    this.deleteFeature(IDS.HORIZONTAL_GUIDE, {silent: true});

    // This relies on the the state of SnapPointMode having a 'point' prop
    DrawPoint.onStop.call(this, state);
};

export default SnapPointMode;
