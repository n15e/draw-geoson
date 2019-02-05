/* eslint-disable */
import distance from '@turf/distance';
import point from 'turf-point';
import topology from './topology';
import compactor from './compactor';

export default function preprocess(graph, options) {
    options = options || {};
    const weightFn =
        options.weightFn ||
        function defaultWeightFn(a, b) {
            return distance(point(a), point(b));
        };

    let topo;

    if (graph.type === 'FeatureCollection') {
        // Graph is GeoJSON data, create a topology from it
        topo = topology(graph, options);
    } else if (graph.edges) {
        // Graph is a preprocessed topology
        topo = graph;
    }

    var graph = topo.edges.reduce(
        (g, edge, i, es) => {
            const a = edge[0];

            const b = edge[1];

            const props = edge[2];

            const w = weightFn(topo.vertices[a], topo.vertices[b], props);

            const makeEdgeList = function makeEdgeList(node) {
                if (!g.vertices[node]) {
                    g.vertices[node] = {};
                    if (options.edgeDataReduceFn) {
                        g.edgeData[node] = {};
                    }
                }
            };

            const concatEdge = function concatEdge(startNode, endNode, weight) {
                const v = g.vertices[startNode];
                v[endNode] = weight;
                if (options.edgeDataReduceFn) {
                    g.edgeData[startNode][endNode] = options.edgeDataReduceFn(
                        options.edgeDataSeed,
                        props
                    );
                }
            };

            if (w) {
                makeEdgeList(a);
                makeEdgeList(b);
                if (w instanceof Object) {
                    if (w.forward) {
                        concatEdge(a, b, w.forward);
                    }
                    if (w.backward) {
                        concatEdge(b, a, w.backward);
                    }
                } else {
                    concatEdge(a, b, w);
                    concatEdge(b, a, w);
                }
            }

            if (i % 1000 === 0 && options.progress) {
                options.progress('edgeweights', i, es.length);
            }

            return g;
        },
        {edgeData: {}, vertices: {}}
    );

    const compact = compactor.compactGraph(graph.vertices, topo.vertices, graph.edgeData, options);

    return {
        vertices: graph.vertices,
        edgeData: graph.edgeData,
        sourceVertices: topo.vertices,
        compactedVertices: compact.graph,
        compactedCoordinates: compact.coordinates,
        compactedEdges: options.edgeDataReduceFn ? compact.reducedEdges : null,
    };
}
