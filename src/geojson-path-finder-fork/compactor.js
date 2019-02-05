/* eslint-disable */
function findNextEnd(prev, v, vertices, ends, vertexCoords, edgeData, trackIncoming, options) {
    let weight = vertices[prev][v];

    let reverseWeight = vertices[v][prev];

    const coordinates = [];

    const path = [];

    let reducedEdge = options.edgeDataSeed;

    while (!ends[v]) {
        const edges = vertices[v];

        if (!edges) {
            break;
        }

        const next = Object.keys(edges).filter(k => k !== prev)[0];
        weight += edges[next];

        if (trackIncoming) {
            reverseWeight += vertices[next][v];

            if (path.indexOf(v) >= 0) {
                ends[v] = vertices[v];
                break;
            }
            path.push(v);
        }

        if (options.edgeDataReduceFn) {
            reducedEdge = options.edgeDataReduceFn(reducedEdge, edgeData[v][next]);
        }

        coordinates.push(vertexCoords[v]);
        prev = v;
        v = next;
    }

    return {
        vertex: v,
        weight,
        reverseWeight,
        coordinates,
        reducedEdge,
    };
}

function compactNode(k, vertices, ends, vertexCoords, edgeData, trackIncoming, options) {
    options = options || {};
    const neighbors = vertices[k];
    return Object.keys(neighbors).reduce(
        (result, j) => {
            const neighbor = findNextEnd(
                k,
                j,
                vertices,
                ends,
                vertexCoords,
                edgeData,
                trackIncoming,
                options
            );
            const weight = neighbor.weight;
            const reverseWeight = neighbor.reverseWeight;
            if (neighbor.vertex !== k) {
                if (!result.edges[neighbor.vertex] || result.edges[neighbor.vertex] > weight) {
                    result.edges[neighbor.vertex] = weight;
                    result.coordinates[neighbor.vertex] = [vertexCoords[k]].concat(
                        neighbor.coordinates
                    );
                    result.reducedEdges[neighbor.vertex] = neighbor.reducedEdge;
                }
                if (
                    trackIncoming &&
                    !isNaN(reverseWeight) &&
                    (!result.incomingEdges[neighbor.vertex] ||
                        result.incomingEdges[neighbor.vertex] > reverseWeight)
                ) {
                    result.incomingEdges[neighbor.vertex] = reverseWeight;
                    const coordinates = [vertexCoords[k]].concat(neighbor.coordinates);
                    coordinates.reverse();
                    result.incomingCoordinates[neighbor.vertex] = coordinates;
                }
            }
            return result;
        },
        {edges: {}, incomingEdges: {}, coordinates: {}, incomingCoordinates: {}, reducedEdges: {}}
    );
}

function compactGraph(vertices, vertexCoords, edgeData, options) {
    options = options || {};
    const progress = options.progress;
    const ends = Object.keys(vertices).reduce((es, k, i, vs) => {
        const vertex = vertices[k];
        const edges = Object.keys(vertex);
        const numberEdges = edges.length;
        let remove;

        if (numberEdges === 1) {
            const other = vertices[edges[0]];
            remove = !other[k];
        } else if (numberEdges === 2) {
            remove = edges.filter(n => vertices[n][k]).length === numberEdges;
        } else {
            remove = false;
        }

        if (!remove) {
            es[k] = vertex;
        }

        if (i % 1000 === 0 && progress) {
            progress('compact:ends', i, vs.length);
        }

        return es;
    }, {});

    return Object.keys(ends).reduce(
        (result, k, i, es) => {
            const compacted = compactNode(
                k,
                vertices,
                ends,
                vertexCoords,
                edgeData,
                false,
                options
            );
            result.graph[k] = compacted.edges;
            result.coordinates[k] = compacted.coordinates;

            if (options.edgeDataReduceFn) {
                result.reducedEdges[k] = compacted.reducedEdges;
            }

            if (i % 1000 === 0 && progress) {
                progress('compact:nodes', i, es.length);
            }

            return result;
        },
        {graph: {}, coordinates: {}, reducedEdges: {}}
    );
}

export default {
    compactNode,
    compactGraph,
};
