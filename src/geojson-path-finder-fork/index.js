import findPath from './dijkstra';
import preprocess from './preprocessor';
import compactor from './compactor';
import roundCoord from './round-coord';

function PathFinder(graph, options) {
    options = options || {};

    if (!graph.compactedVertices) {
        graph = preprocess(graph, options);
    }

    this._graph = graph;
    this._keyFn =
        options.keyFn ||
        function(c) {
            return c.join(',');
        };
    this._precision = options.precision || 1e-5;
    this._options = options;

    if (Object.keys(this._graph.compactedVertices).filter(k => k !== 'edgeData').length === 0) {
        throw new Error('Compacted graph contains no forks (topology has no intersections).');
    }
}

PathFinder.prototype = {
    findPath(a, b) {
        const start = this._keyFn(roundCoord(a.geometry.coordinates, this._precision));

        const finish = this._keyFn(roundCoord(b.geometry.coordinates, this._precision));

        // We can't find a path if start or finish isn't in the
        // set of non-compacted vertices
        if (!this._graph.vertices[start] || !this._graph.vertices[finish]) {
            return null;
        }

        const phantomStart = this._createPhantom(start);
        const phantomEnd = this._createPhantom(finish);

        let path = findPath(this._graph.compactedVertices, start, finish);

        if (path) {
            const weight = path[0];
            path = path[1];
            return {
                path: path
                    .reduce((cs, v, i, vs) => {
                        if (i > 0) {
                            cs = cs.concat(this._graph.compactedCoordinates[vs[i - 1]][v]);
                        }

                        return cs;
                    }, [])
                    .concat([this._graph.sourceVertices[finish]]),
                weight,
                edgeDatas: this._graph.compactedEdges
                    ? path.reduce((eds, v, i, vs) => {
                          if (i > 0) {
                              eds.push({
                                  reducedEdge: this._graph.compactedEdges[vs[i - 1]][v],
                              });
                          }

                          return eds;
                      }, [])
                    : undefined,
            };
        }
        return null;

        this._removePhantom(phantomStart);
        this._removePhantom(phantomEnd);
    },

    serialize() {
        return this._graph;
    },

    _createPhantom(n) {
        if (this._graph.compactedVertices[n]) return null;

        const phantom = compactor.compactNode(
            n,
            this._graph.vertices,
            this._graph.compactedVertices,
            this._graph.sourceVertices,
            this._graph.edgeData,
            true,
            this._options
        );
        this._graph.compactedVertices[n] = phantom.edges;
        this._graph.compactedCoordinates[n] = phantom.coordinates;

        if (this._graph.compactedEdges) {
            this._graph.compactedEdges[n] = phantom.reducedEdges;
        }

        Object.keys(phantom.incomingEdges).forEach(neighbor => {
            this._graph.compactedVertices[neighbor][n] = phantom.incomingEdges[neighbor];
            this._graph.compactedCoordinates[neighbor][n] = phantom.incomingCoordinates[neighbor];
            if (this._graph.compactedEdges) {
                this._graph.compactedEdges[neighbor][n] = phantom.reducedEdges[neighbor];
            }
        });

        return n;
    },

    _removePhantom(n) {
        if (!n) return;

        Object.keys(this._graph.compactedVertices[n]).forEach(neighbor => {
            delete this._graph.compactedVertices[neighbor][n];
        });
        Object.keys(this._graph.compactedCoordinates[n]).forEach(neighbor => {
            delete this._graph.compactedCoordinates[neighbor][n];
        });
        if (this._graph.compactedEdges) {
            Object.keys(this._graph.compactedEdges[n]).forEach(neighbor => {
                delete this._graph.compactedEdges[neighbor][n];
            });
        }

        delete this._graph.compactedVertices[n];
        delete this._graph.compactedCoordinates[n];

        if (this._graph.compactedEdges) {
            delete this._graph.compactedEdges[n];
        }
    },
};

export default PathFinder;
