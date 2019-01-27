import Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';

const SnapMode = {...DrawPolygon};

const IDS = {
  VERTICAL_LINE_GUIDE: 'VERTICAL_LINE_GUIDE',
  HORIZONTAL_LINE_GUIDE: 'HORIZONTAL_LINE_GUIDE',
};

/**
 * Takes a point and maybe adds it to the list of guides.
 *
 * Mutates guides.
 *
 * @param guides
 * @param point
 */
const addPointToGuides = (guides, point) => {
  // Round to the nearest pixel
  const x = Math.round(point.x);
  const y = Math.round(point.y);

  // Don't add points not visible on the page (it's annoying)
  if (x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight) {
    // Don't add duplicates
    if (!guides.vertical.includes(x)) guides.vertical.push(x);
    if (!guides.horizontal.includes(y)) guides.horizontal.push(y);
  }
};

/**
 * Loops over all features to get vertical and horizontal guides to snap to
 *
 * @param map
 * @param draw
 * @param polygonId
 * @returns {{vertical: Array, horizontal: Array}}
 */
const findGuidesFromFeatures = (map, draw, polygonId) => {
  const features = draw.getAll().features;

  // TODO (davidg): re-run this on map pan or zoom (or screen resize?)
  const guides = {
    vertical: [],
    horizontal: [],
  };

  features.forEach(feature => {
    // If this is re-running because a user is moving the map, the features might include
    // guides or the last leg of a polygon
    if (feature.id === IDS.HORIZONTAL_LINE_GUIDE || feature.id === IDS.VERTICAL_LINE_GUIDE) return;

    const getCoordinates = array => {
      if (!Array.isArray(array)) throw Error('Your array is not an array');

      if (Array.isArray(array[0])) {
        // This is an array of arrays, we must go deeper
        array.forEach(getCoordinates);
      } else {
        // If not an array of array, only consider arrays with two items
        if (array.length === 2) {
          const point = map.project(array);

          addPointToGuides(guides, point);
        }
      }
    };

    // For the current polygon, the last two points are the mouse position and back home
    // so we chop those off (else we get guides showing where the user clicked, even
    // if they were just panning the map)
    const coordinates = feature.id === polygonId
      ? feature.geometry.coordinates[0].slice(0, -2)
      : feature.geometry.coordinates;

    getCoordinates(coordinates);
  });

  return guides;
};

/**
 * For a given point, this returns any vertical and/or horizontal guides within snapping distance
 *
 * @param guides
 * @param point
 * @param snapPx
 * @returns {{vertical: number | undefined, horizontal: number | undefined}}
 */
const getNearbyGuides = (guides, point, snapPx) => {
  const nearbyVerticalGuide = guides.vertical.find(guide => (
    Math.abs(guide - point.x) < snapPx
  ));

  const nearbyHorizontalGuide = guides.horizontal.find(guide => (
    Math.abs(guide - point.y) < snapPx
  ));

  return {
    verticalPx: nearbyVerticalGuide,
    horizontalPx: nearbyHorizontalGuide,
  }
};

/**
 * Returns snap points if there are any, otherwise the original lng/lat of the event
 * Also, defines if guides should show on the state object
 *
 * Mutates the state object
 *
 * @param state
 * @param e
 * @returns {{lng: number, lat: number}}
 */
const snap = (state, e) => {
  let lng = e.lngLat.lng;
  let lat = e.lngLat.lat;

  const { verticalPx, horizontalPx } = getNearbyGuides(state.guides, e.point, state.snapPx);

  if (verticalPx) {
    // Draw a line from top to bottom
    const lngLatTop = state.map.unproject({x: verticalPx, y: 0});
    const lngLatBottom = state.map.unproject({x: verticalPx, y: window.innerHeight});
    const lngLatPoint = state.map.unproject({x: verticalPx, y: e.point.y});

    state.verticalLine.updateCoordinate(0, lngLatTop.lng, lngLatTop.lat);
    state.verticalLine.updateCoordinate(1, lngLatBottom.lng, lngLatBottom.lat);

    lng = lngLatPoint.lng;
    lat = lngLatPoint.lat;
  }

  if (horizontalPx) {
    // Draw a line from left to right
    const lngLatLeft = state.map.unproject({x: 0, y: horizontalPx});
    const lngLatRight = state.map.unproject({x: window.innerWidth, y: horizontalPx});
    const lngLatPoint = state.map.unproject({x: e.point.x, y: horizontalPx});

    state.horizontalLine.updateCoordinate(0, lngLatLeft.lng, lngLatLeft.lat);
    state.horizontalLine.updateCoordinate(1, lngLatRight.lng, lngLatRight.lat);

    lng = lngLatPoint.lng;
    lat = lngLatPoint.lat;
  }

  if (verticalPx && horizontalPx) {
    // For rather complicated reasons, we need to explicitly set both so it behaves on a rotated map
    const lngLatPoint = state.map.unproject({x: verticalPx, y: horizontalPx});

    lng = lngLatPoint.lng;
    lat = lngLatPoint.lat;
  }

  state.showVerticalSnapLine = !!verticalPx;
  state.showHorizontalSnapLine = !!horizontalPx;

  return { lng, lat };
};

SnapMode.onSetup = function({ snapPx = 10, draw }) {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });

  // Our temporary guide lines
  const verticalLine = this.newFeature({
    id: IDS.VERTICAL_LINE_GUIDE,
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
    id: IDS.HORIZONTAL_LINE_GUIDE,
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

  // A dog's breakfast
  const state = {
    currentVertexPosition: 0,
    draw,
    guides: findGuidesFromFeatures(this.map, draw, polygon.id),
    horizontalLine,
    map: this.map,
    polygon,
    snapPx,
    verticalLine,
  };

  this.map.on('moveend', () => {
    // Update the guides after zoom, pan, rotate, and resize
    state.guides = findGuidesFromFeatures(this.map, draw, polygon.id);
  });

  return state;
};

SnapMode.onClick = function(state) {
  // End the thing when the click is on the previous position
  if (state.currentVertexPosition > 0) {
    const lastVertex = state.polygon.coordinates[0][state.currentVertexPosition - 1];

    if (lastVertex[0] === state.snappedLng && lastVertex[1] === state.snappedLat) {
      this._deleteGuides(state);
      return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
    }
  }

  const point = state.map.project({lng: state.snappedLng, lat: state.snappedLat});
  addPointToGuides(state.guides, point);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, state.snappedLng, state.snappedLat);
  state.currentVertexPosition++;
  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, state.snappedLng, state.snappedLat);
};

SnapMode.onMouseMove = function(state, e) {
  const { lng, lat } = snap(state, e);

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
  state.snappedLng = lng;
  state.snappedLat = lat;

  this.updateUIClasses({ mouse: Constants.cursors.ADD });
};

SnapMode._deleteGuides = function() {
  this.deleteFeature(IDS.VERTICAL_LINE_GUIDE, { silent: true });
  this.deleteFeature(IDS.HORIZONTAL_LINE_GUIDE, { silent: true });
};

// This is 'extending' DrawPolygon.toDisplayFeatures
SnapMode.toDisplayFeatures = function(state, geojson, display) {
  if (geojson.properties.id === IDS.VERTICAL_LINE_GUIDE && !state.showVerticalSnapLine) {
    return;
  }

  if (geojson.properties.id === IDS.HORIZONTAL_LINE_GUIDE && !state.showHorizontalSnapLine) {
    return;
  }

  // This relies on the the state of SnapMode being similar to DrawPolygon
  DrawPolygon.toDisplayFeatures(state, geojson, display);
};

// This is 'extending' DrawPolygon.onStop
SnapMode.onStop = function(state) {
  this._deleteGuides(state);

  // This relies on the the state of SnapMode being similar to DrawPolygon
  DrawPolygon.onStop.call(this, state);
};

export default SnapMode;
