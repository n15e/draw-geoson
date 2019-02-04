import Queue from 'tinyqueue';

export default function(graph, start, end) {
    const costs = {};
    costs[start] = 0;
    const initialState = [0, [start], start];
    const queue = new Queue([initialState], (a, b) => a[0] - b[0]));
    const explored = {};

    while (queue.length) {
        var state = queue.pop();
        var cost = state[0];
        const node = state[2];
        if (node === end) {
            return state.slice(0, 2);
        }

        var neighbours = graph[node];
        Object.keys(neighbours).forEach(n => {
            let newCost = cost + neighbours[n];
            if (!(n in costs) || newCost < costs[n]) {
                costs[n] = newCost;
                let newState = [newCost, state[1].concat([n]), n];
                queue.push(newState);
            }
        });
    }

    return null;
}
