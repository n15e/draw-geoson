import Constants from '@mapbox/mapbox-gl-draw/src/constants';

export const IDS = {
  VERTICAL_GUIDE: 'VERTICAL_GUIDE',
  HORIZONTAL_GUIDE: 'HORIZONTAL_GUIDE',
};

// Note: this lng/lat rounding doesn't have anything to do with snapping,
// but can reduce output file size quite a lot
// There's not much point in 13 decimal places of lng/lat.

// Number of decimal places in lat/lng values
// One day could be configurable
export const ACCURACY = {
  '1 m': 5,
  '10 cm': 6,
  '1 cm': 7,
  '1 mm': 8,
};

const round = (num, decimals) => Math.round(num * 10 ** decimals) / 10 ** decimals;

export const roundLngLatTo1Cm = num => round(num, ACCURACY['1 cm']);

/**
 * Takes a point and maybe adds it to the list of guides.
 *
 * Mutates guides.
 *
 * @param {object} guides
 * @param {Array<number>} guides.vertical
 * @param {Array<number>} guides.horizontal
 * @param {object} point
 * @param {number} point.x
 * @param {number} point.y
 * @param {boolean} [forceInclusion]
 */
export const addPointToGuides = (guides, point, forceInclusion) => {
  // Round to the nearest pixel, reduces the number of guides and also is just sensible
  const x = Math.round(point.x);
  const y = Math.round(point.y);

  // Don't add points not visible on the page (it's annoying)
  const pointIsOnTheScreen = x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight;

  // But do add off-screen points if forced (e.g. for the current feature)
  // So features will always snap to their own points
  if (pointIsOnTheScreen || forceInclusion) {
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
 * @param currentFeature
 * @returns {{vertical: Array, horizontal: Array}}
 */
export const findGuidesFromFeatures = (map, draw, currentFeature) => {
  const features = draw.getAll().features;

  const guides = {
    vertical: [],
    horizontal: [],
  };

  features.forEach(feature => {
    const isTheCurrentFeature = feature.id === currentFeature.id;

    // If this is re-running because a user is moving the map, the features might include
    // guides or the last leg of a polygon
    if (feature.id === IDS.HORIZONTAL_GUIDE || feature.id === IDS.VERTICAL_GUIDE) return;

    const getCoordinates = array => {
      if (!Array.isArray(array)) throw Error('Your array is not an array');

      if (Array.isArray(array[0])) {
        // This is an array of arrays, we must go deeper
        array.forEach(getCoordinates);
      } else {
        // If not an array of arrays, only consider arrays with two items
        if (array.length === 2) {
          addPointToGuides(guides, map.project(array), isTheCurrentFeature);
        }
      }
    };

    let coordinates;

    if (isTheCurrentFeature && currentFeature.type === Constants.geojsonTypes.POLYGON) {
      // For the current polygon, the last two points are the mouse position and back home
      // so we chop those off (else we get guides showing where the user clicked, even
      // if they were just panning the map)
      coordinates = feature.geometry.coordinates[0].slice(0, -2);
    } else {
      coordinates = feature.geometry.coordinates;
    }

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
export const snap = (state, e) => {
  // TODO (davidg): 'snapAndDrawGuides'
  let lng = e.lngLat.lng;
  let lat = e.lngLat.lat;

  // Holding alt bypasses all snapping
  if (e.originalEvent.altKey) {
    state.showVerticalSnapLine = false;
    state.showHorizontalSnapLine = false;

    return { lng, lat };
  }

  const { verticalPx, horizontalPx } = getNearbyGuides(state.guides, e.point, state.snapPx);

  if (verticalPx) {
    // Draw a line from top to bottom
    const lngLatTop = state.map.unproject({x: verticalPx, y: 0});
    const lngLatBottom = state.map.unproject({x: verticalPx, y: window.innerHeight});
    const lngLatPoint = state.map.unproject({x: verticalPx, y: e.point.y});

    state.verticalGuide.updateCoordinate(0, lngLatTop.lng, lngLatTop.lat);
    state.verticalGuide.updateCoordinate(1, lngLatBottom.lng, lngLatBottom.lat);

    lng = lngLatPoint.lng;
    lat = lngLatPoint.lat;
  }

  if (horizontalPx) {
    // Draw a line from left to right
    const lngLatLeft = state.map.unproject({x: 0, y: horizontalPx});
    const lngLatRight = state.map.unproject({x: window.innerWidth, y: horizontalPx});
    const lngLatPoint = state.map.unproject({x: e.point.x, y: horizontalPx});

    state.horizontalGuide.updateCoordinate(0, lngLatLeft.lng, lngLatLeft.lat);
    state.horizontalGuide.updateCoordinate(1, lngLatRight.lng, lngLatRight.lat);

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

export const getGuideFeature = id => ({
  id,
  type: Constants.geojsonTypes.FEATURE,
  properties: {
    isSnapGuide: 'true', // for styling
  },
  geometry: {
    type: Constants.geojsonTypes.LINE_STRING,
    coordinates: [],
  },
});
