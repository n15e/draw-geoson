import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import uuid from 'uuid/v4';
import * as turf from '@turf/turf';
import SnapPointMode from './snapModes/SnapPointMode';
import SnapPolygonMode from './snapModes/SnapPolygonMode';
import SnapLineMode from './snapModes/SnapLineMode';
import customDrawStyles from './customDrawStyles';
import mockData from '../data/mockData';
import PathFinder from '../geojson-path-finder-fork';

let draw;
let map;

const getStartAndEnd = () => {
    // just a hack to get first and last kiosk
    const kiosks = draw
        .getAll()
        .features.filter(feature => feature.properties.featureType === 'kiosk');

    if (kiosks.length < 2) return {};

    return {
        start: kiosks[0],
        end: kiosks[kiosks.length - 1],
    };
};

const addDummyData = () => {
    draw.add(mockData);

    const features = mockData.features
        .filter(feature => ['anchor', 'unit', 'kiosk'].includes(feature.properties.featureType))
        .sort((a, b) => {
            const aWeight = a.properties.weight || 0;
            const bWeight = b.properties.weight || 0;
            // TODO (davidg): could also sort by polygon area.
            return bWeight - aWeight;
        });
    const featureCollection = {
        type: 'FeatureCollection',
        features,
    };
    draw.add(featureCollection);
    map.addSource('labels', {
        type: 'geojson',
        data: featureCollection,
    });
    map.addLayer({
        id: 'symbols',
        type: 'symbol',
        source: 'labels',
        layout: {
            'text-field': '{destinationName}', // part 2 of this is how to do it
            'text-size': 12,
            'symbol-z-order': 'source',
        },
        paint: {
            'text-color': '#725038',
            'text-halo-color': '#ffffff',
        },
    });
};

const drawShortestPath = () => {
    draw.delete('route');

    const lines = mockData.features.filter(
        feature => feature.properties.featureType === 'routeSegment'
    );

    if (!lines.length) return;

    const lineArray = lines.map(line => line.geometry.coordinates);

    const multiLine = turf.multiLineString(lineArray);

    const splitLineFeatures = [];

    lines.forEach(line => {
        // We must create unique IDs, else draw will fail to draw some lines
        const splitLines = turf.lineSplit(line, multiLine).features.map(feature => ({
            ...feature,
            id: uuid(),
            properties: {
                featureType: 'routeSegment',
                pam: 'true',
            },
        }));

        splitLineFeatures.push(...splitLines);
    });

    const splitLineFeatureCollection = turf.featureCollection(splitLineFeatures);

    // Find the potential start and end points

    const {start, end} = getStartAndEnd();
    if (!start || !end) return;

    const pathfinder = new PathFinder(splitLineFeatureCollection);
    const nodes = turf.explode(splitLineFeatureCollection);
    const possibleStartPoints = turf.pointsWithinPolygon(nodes, start).features;
    const possibleEndPoints = turf.pointsWithinPolygon(nodes, end).features;

    if (!possibleStartPoints || !possibleEndPoints) return;

    let shortestPath;

    // There might be several nodes within the start/end polygon, find the shortest path of
    // all combinations
    possibleStartPoints.forEach(possibleStartPoint => {
        possibleEndPoints.forEach(possibleEndPoint => {
            const path = pathfinder.findPath(possibleStartPoint, possibleEndPoint);

            if (!path) return;

            if (!shortestPath || path.weight < shortestPath.weight) {
                shortestPath = path;
            }
        });
    });

    if (shortestPath) {
        const lineString = turf.lineString(shortestPath.path);
        lineString.id = 'route'; // for styles

        const route = turf.featureCollection([lineString]);

        draw.add(route);
    }
};

export const updateLabels = () => {
    const featureCollection = draw.getAll();
    const labelSource = map.getSource('labels');
    if (labelSource) {
        labelSource.setData(featureCollection);
    }
};

const refresh = () => {
    drawShortestPath();
    updateLabels();
};

export const initMap = container => {
    map = new mapboxGl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [-73.979582, 40.764116],
        zoom: 14.5,
        hash: true,
        pitchWithRotate: false,
        keyboard: false,
    });

    draw = new MapboxDraw({
        modes: {
            ...MapboxDraw.modes,
            snap_point: SnapPointMode,
            snap_polygon: SnapPolygonMode,
            snap_line: SnapLineMode,
        },
        styles: customDrawStyles,
        userProperties: true,
    });

    map.addControl(draw, 'bottom-left');

    window.map = map;
    window.draw = draw;

    map.on('load', () => {
        addDummyData();
        refresh();

        map.on('draw.create', refresh);
        map.on('draw.delete', refresh);
        map.on('draw.update', refresh);
    });

    return map;
};

export const getMap = () => map;
export const getDraw = () => draw;
export const getFeature = featureId => draw.get(featureId);
export const getAllFeatures = () => draw.getAll().features;
export const setFeatureProperty = (featureId, property, value) =>
    draw.setFeatureProperty(featureId, property, value);

export const changeDrawMode = (...args) => draw.changeMode(...args);
