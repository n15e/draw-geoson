import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';

const SnapMode = {...DrawPolygon};

// Performance improvements:
// - dedupe guides (multiple points with same values)
// - gather guide points only for features on screen (does featuresAt take a bbox?)
// - only re-assess snapping after certain movement distance of mouse (and/or time)
// - set global tolerance (round down lat/lng) - smaller numbers, fewer snap points from
//   existing geojson

/**
 * Loops over all features to get vertical and horizontal lines to snap to
 *
 * @param features
 * @returns {{vertical: Array, horizontal: Array}}
 */
const getAllGuides = features => {
  const guides = {
    vertical: [],
    horizontal: [],
  };

  features.forEach(feature => {
    const getCoordinates = array => {
      if (!Array.isArray(array)) throw Error('Your array is not an array');

      if (array.length === 2 && !Array.isArray(array[0])) {
        guides.vertical.push(array[0]);
        guides.horizontal.push(array[1]);
      } else {
        array.forEach(getCoordinates);
      }
    };

    getCoordinates(feature.geometry.coordinates);
  });

  return guides;
};

/**
 * For a given point, this returns whether there are any vertical and/or horizontal guides within
 * snapping distance
 *
 * @param guides
 * @param point
 * @param tolerance
 * @returns {{vertical: number | undefined, horizontal: number | undefined}}
 */
const getNearbyGuides = (guides, point, tolerance) => {
  // TODO (davidg): could filter for the nearest of several near guides
  const nearbyVerticalGuide = guides.vertical.find(guide => (
    Math.abs(guide - point.lng) < tolerance
  ));

  const nearbyHorizontalGuide = guides.horizontal.find(guide => (
    Math.abs(guide - point.lat) < tolerance
  ));

  return {
    vertical: nearbyVerticalGuide,
    horizontal: nearbyHorizontalGuide,
  }
};

/**
 * return snap points if there are any, otherwise the original lng/lat of the event
 * Also, defines if guides should show on the state object
 *
 * @param state
 * @param e
 * @returns {{lng: number, lat: number}}
 */
const snap = (state, e) => {
  // I don't love that this mutates state, but I guess that's how the whole thing works.
  let lng = e.lngLat.lng;
  let lat = e.lngLat.lat;

  const nearbyGuides = getNearbyGuides(state.guides, e.lngLat, state.tolerance);

  if (nearbyGuides.vertical) {
    lng = nearbyGuides.vertical;
    state.verticalLine.updateCoordinate(0, lng, 90);
    state.verticalLine.updateCoordinate(1, lng, -90);
  }

  if (nearbyGuides.horizontal) {
    lat = nearbyGuides.horizontal;
    state.horizontalLine.updateCoordinate(0, -180, lat);
    state.horizontalLine.updateCoordinate(1, 180, lat);
  }

  state.showVerticalSnapLine = !!nearbyGuides.vertical;
  state.showHorizontalSnapLine = !!nearbyGuides.horizontal;

  return { lng, lat };
};

SnapMode.onSetup = function({ features, snapPx = 5 }) {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });

  const verticalLine = this.newFeature({
    id: 'vertical-line-guide',
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      isSnapGuide: 'true',
    },
    geometry: {
      type: Constants.geojsonTypes.LINE_STRING,
      coordinates: [],
    },
  });

  const horizontalLine = this.newFeature({
    id: 'horizontal-line-guide',
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      isSnapGuide: 'true',
    },
    geometry: {
      type: Constants.geojsonTypes.LINE_STRING,
      coordinates: [],
    },
  });

  this.addFeature(polygon);
  this.addFeature(verticalLine);
  this.addFeature(horizontalLine);
  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);

  const getTolerance = () => {
    // Converts a tolerance in pixels to a tolerance in lat/lng
    const bounds = this.map.getBounds();
    return (bounds.getEast() - bounds.getWest()) * (snapPx / window.innerWidth);
  };

  const state = {
    currentVertexPosition: 0,
    guides: getAllGuides(features),
    horizontalLine,
    polygon,
    tolerance: getTolerance(),
    verticalLine,
  };

  this.map.on('zoom', () => {
    state.tolerance = getTolerance();
  });

  return state;
};

SnapMode.onClick = function(state) {
  // End the thing when the click is on the previous position
  if (state.currentVertexPosition > 0) {
    const lastVertex = state.polygon.coordinates[0][state.currentVertexPosition - 1];

    if (lastVertex[0] === state.snappedLng && lastVertex[1] === state.snappedLat) {
      return this._onFinish(state);
    }
  }
  state.guides.vertical.push(state.snappedLng);
  state.guides.horizontal.push(state.snappedLat);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, state.snappedLng, state.snappedLat);
  state.currentVertexPosition++;
  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, state.snappedLng, state.snappedLat);
};

SnapMode.onMouseMove = function(state, e) {
  // TODO (davidg): this would read const { lng, lat } = this.map.snap ? snap(state, e) : e.lngLat
  const { lng, lat } = snap(state, e);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
  state.snappedLng = lng;
  state.snappedLat = lat;

  // Hack! Custom modes seem to get their mouse cursor reset to none
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
};

SnapMode._onFinish = function(state) {
  this.deleteFeature([state.horizontalLine.id], { silent: true });
  this.deleteFeature([state.verticalLine.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
};

SnapMode.toDisplayFeatures = function(state, geojson, display) {
  if (geojson.properties.id === 'vertical-line-guide' && !state.showVerticalSnapLine) {
    return;
  }

  if (geojson.properties.id === 'horizontal-line-guide' && !state.showHorizontalSnapLine) {
    return;
  }

  // Poor man's super()
  // This relies on the the state of SnapMode being similar to DrawPolygon
  DrawPolygon.toDisplayFeatures(state, geojson, display);
};

export default SnapMode;
