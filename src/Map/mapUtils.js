import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import uuid from 'uuid/v4';
import * as turf from '@turf/turf';
import SnapPointMode from './snapModes/SnapPointMode';
import SnapPolygonMode from './snapModes/SnapPolygonMode';
import SnapLineMode from './snapModes/SnapLineMode';
import {drawStyles, labelStyle} from './mapStyles';
import mockData from '../data/mockData';
import PathFinder from '../geojson-path-finder-fork';
import destinations from '../data/mockDestinations';

// TODO (davidg): this is duplicated with App. Eventually goes in the store
const destinationMap = destinations.reduce((acc, destination) => {
    acc[destination.id] = destination.name;
    return acc;
}, {});

let draw;
let map;

export const setMapCenter = coordinates => map.setCenter(coordinates);
export const getMap = () => map;
export const getDraw = () => draw;
export const getFeature = featureId => draw.get(featureId);
export const getAllFeatures = () => draw.getAll().features;
export const getAllAsFeatureCollection = () => draw.getAll();
export const setFeatureProperty = (featureId, property, value) =>
    draw.setFeatureProperty(featureId, property, value);
export const changeDrawMode = (...args) => draw.changeMode(...args);

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

    const featureCollection = turf.featureCollection(features);

    // Add the actual features to the map
    draw.add(featureCollection);

    // Add the labels, derived from the features
    map.addSource('labels', {
        type: 'geojson',
        data: featureCollection,
    });

    map.addLayer(labelStyle);
};

export const drawShortestPath = (startFeature, endFeature) => {
    draw.delete('route');

    if (!startFeature || !endFeature) return;

    const lines = getAllFeatures().filter(
        feature => feature.properties.featureType === 'routeSegment'
    );

    if (!lines.length) return;

    const lineArray = lines.map(line => line.geometry.coordinates);

    const multiLine = turf.multiLineString(lineArray);

    const splitLineFeatures = [];

    lines.forEach(line => {
        // TODO (davidg): I need to handle lines that end on another line. ATM if they don't
        // overlap, they don't create a node as a result of turf.lineSplit()
        // Maybe the answer is to split the target line when I finish drawing a line that
        // ends very close to another line. Or snap lines to other lines. It would have to be
        // super exactly on the line for lineSplit to get it.
        // Note that lineSplit truncates to 7 decimal places internally
        const splitLines = turf.lineSplit(line, multiLine).features.map(feature => ({
            ...feature,
            // We must create unique IDs, else draw.add() will fail to draw some lines
            id: uuid(),
            properties: {
                featureType: 'routeSegment',
                pam: 'true',
            },
        }));

        splitLineFeatures.push(...splitLines);
    });

    const splitLineFeatureCollection = turf.featureCollection(splitLineFeatures);

    const pathfinder = new PathFinder(splitLineFeatureCollection, {
        // Without this, pathfinder can use nodes that aren't actually
        // on a path (if they're quite close to a path)
        precision: 1e-7, // 1cm
    });

    // TODO (davidg): does this create duplicates? For perf perhaps dedupe
    const nodes = turf.explode(splitLineFeatureCollection);

    // For testing
    const drawNodes = turf.featureCollection(
        nodes.features.map(feature => ({
            ...feature,
            properties: {
                ...feature.properties,
                featureType: 'routeNode',
            },
        }))
    );
    draw.add(drawNodes);

    // There might be several nodes within the start/end polygon, find the shortest path of
    // all combinations
    const possibleStartPoints = turf.pointsWithinPolygon(nodes, startFeature).features;
    const possibleEndPoints = turf.pointsWithinPolygon(nodes, endFeature).features;

    if (!possibleStartPoints || !possibleEndPoints) {
        console.warn('There were no start or end points within the selected features');
        // TODO (davidg): test for nearby points? e.g. tolerance for end nodes of 10cm?
        return;
    }

    let shortestPath;

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
        lineString.id = 'route'; // for styling

        const route = turf.featureCollection([lineString]);

        draw.add(route);
    } else {
        console.warn('No path could be found between these two locations');
    }
};

export const renderLabels = () => {
    const featureCollection = draw.getAll();

    // We mix the destination names into the features
    featureCollection.features = featureCollection.features.map(feature => {
        if (!feature.properties.destinationId) return feature;
        return {
            ...feature,
            properties: {
                ...feature.properties,
                destinationName: destinationMap[feature.properties.destinationId],
            },
        };
    });

    const labelSource = map.getSource('labels');

    if (labelSource) {
        labelSource.setData(featureCollection);
    }
};

export const initMap = container => {
    map = new mapboxGl.Map({
        container,
        style: 'mapbox://styles/mapbox/streets-v10',
        center: [-73.979582, 40.764116],
        zoom: 14.5,
        maxZoom: 24,
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
        styles: drawStyles,
        userProperties: true,
    });

    map.addControl(draw, 'bottom-left');

    // For testing
    window.map = map;
    window.draw = draw;

    map.on('load', () => {
        addDummyData();
        renderLabels();

        map.on('draw.create', renderLabels);
        map.on('draw.delete', renderLabels);
        map.on('draw.update', renderLabels);
    });

    return map;
};
