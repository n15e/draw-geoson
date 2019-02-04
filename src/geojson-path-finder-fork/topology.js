import {explode} from '@turf/turf';
import roundCoord from './round-coord';

function geoJsonReduce(geojson, fn, seed) {
    if (geojson.type === 'FeatureCollection') {
        return geojson.features.reduce((a, f) => geoJsonReduce(f, fn, a), seed);
    }
    return fn(seed, geojson);
}

function geoJsonFilterFeatures(geojson, fn) {
    let features = [];
    if (geojson.type === 'FeatureCollection') {
        features = features.concat(geojson.features.filter(fn));
    }

    return {
        type: 'FeatureCollection',
        features,
    };
}

function isLineString(f) {
    return f.geometry.type === 'LineString';
}

function topology(geojson, options) {
    options = options || {};
    const keyFn =
        options.keyFn ||
        function defaultKeyFn(c) {
            return c.join(',');
        };

    const precision = options.precision || 1e-5;

    const lineStrings = geoJsonFilterFeatures(geojson, isLineString);
    const explodedLineStrings = explode(lineStrings);
    const vertices = explodedLineStrings.features.reduce((cs, f, i, fs) => {
        const rc = roundCoord(f.geometry.coordinates, precision);
        cs[keyFn(rc)] = f.geometry.coordinates;

        if (i % 1000 === 0 && options.progress) {
            options.progress('topo:vertices', i, fs.length);
        }

        return cs;
    }, {});

    const edges = geoJsonReduce(
        lineStrings,
        (es, f, i, fs) => {
            f.geometry.coordinates.forEach((c, i, cs) => {
                if (i > 0) {
                    const k1 = keyFn(roundCoord(cs[i - 1], precision));

                    const k2 = keyFn(roundCoord(c, precision));
                    es.push([k1, k2, f.properties]);
                }
            });

            if (i % 1000 === 0 && options.progress) {
                options.progress('topo:edges', i, fs.length);
            }

            return es;
        },
        []
    );

    return {
        vertices,
        edges,
    };
}

export default topology;
