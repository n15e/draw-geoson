import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import {
  addPointToGuides,
  findGuidesFromFeatures,
  getGuideFeature,
  IDS,
  roundLngLatTo1Cm,
  snap,
} from './snapUtils';

const SnapMode = {...DrawPolygon};

SnapMode.onSetup = function({ snapPx = 10, draw }) {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });

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
    draw,
    guides: findGuidesFromFeatures(this.map, draw, polygon.id),
    horizontalGuide,
    map: this.map,
    polygon,
    snapPx,
    verticalGuide,
  };

  this.map.on('moveend', () => {
    // Update the guide locations after zoom, pan, rotate, or resize
    state.guides = findGuidesFromFeatures(this.map, draw, polygon.id);
  });

  return state;
};

SnapMode.onClick = function(state) {
  // We save some processing by rounding on click, not mousemove
  const lng = roundLngLatTo1Cm(state.snappedLng);
  const lat = roundLngLatTo1Cm(state.snappedLat);

  // End the drawing if this click is on the previous position
  if (state.currentVertexPosition > 0) {
    const lastVertex = state.polygon.coordinates[0][state.currentVertexPosition - 1];

    if (lastVertex[0] === lng && lastVertex[1] === lat) {
      return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
    }
  }

  const point = state.map.project({lng: lng, lat: lat});

  addPointToGuides(state.guides, point);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);

  state.currentVertexPosition++;

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
};

SnapMode.onMouseMove = function(state, e) {
  const { lng, lat } = snap(state, e);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
  state.snappedLng = lng;
  state.snappedLat = lat;

  this.updateUIClasses({ mouse: Constants.cursors.ADD });
};

// This is 'extending' DrawPolygon.toDisplayFeatures
SnapMode.toDisplayFeatures = function(state, geojson, display) {
  if (geojson.properties.id === IDS.VERTICAL_GUIDE && !state.showVerticalSnapLine) {
    return;
  }

  if (geojson.properties.id === IDS.HORIZONTAL_GUIDE && !state.showHorizontalSnapLine) {
    return;
  }

  // This relies on the the state of SnapMode being similar to DrawPolygon
  DrawPolygon.toDisplayFeatures(state, geojson, display);
};

// This is 'extending' DrawPolygon.onStop
SnapMode.onStop = function(state) {
  this.deleteFeature(IDS.VERTICAL_GUIDE, { silent: true });
  this.deleteFeature(IDS.HORIZONTAL_GUIDE, { silent: true });

  // This relies on the the state of SnapMode being similar to DrawPolygon
  DrawPolygon.onStop.call(this, state);
};

export default SnapMode;
