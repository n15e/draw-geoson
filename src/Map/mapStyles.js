import theme from '@mapbox/mapbox-gl-draw/src/lib/theme';

export const labelStyle = {
    id: 'symbols',
    type: 'symbol',
    source: 'labels',
    minzoom: 16.6,
    layout: {
        'text-field': '{destinationName}',
        'text-size': 12,
        'symbol-z-order': 'source',
    },
    paint: {
        'text-color': '#725038',
        'text-halo-color': '#ffffff',
    },
};

const modifiedDefaultStyles = theme.map(defaultStyle => {
    if (defaultStyle.id === 'gl-draw-line-inactive') {
        return {
            ...defaultStyle,
            filter: [
                ...defaultStyle.filter,
                [
                    'all',
                    ['!=', 'user_isSnapGuide', 'true'],
                    ['!=', 'user_pam', 'true'],
                    ['!=', 'id', 'shortest-path'],
                    ['!=', 'id', 'route'],
                ],
            ],
        };
    }

    if (defaultStyle.id.endsWith('-inactive')) {
        return {
            ...defaultStyle,
            filter: [...defaultStyle.filter, ['!=', 'user_pam', 'true']],
        };
    }

    return defaultStyle;
});

const makePolygonStylePair = props => [
    {
        id: `pam-${props.featureType}-fill`,
        type: 'fill',
        minzoom: props.minzoom || 16,
        filter: ['all', ['==', 'active', 'false'], ['==', 'user_featureType', props.featureType]],
        paint: {
            'fill-color': props.fillColor,
            'fill-outline-color': props.borderColor,
            'fill-opacity': 0.5,
        },
    },
    {
        id: `${props.featureType}-line`,
        type: 'line',
        minzoom: props.minzoom || 16,
        filter: ['all', ['==', 'active', 'false'], ['==', 'user_featureType', props.featureType]],
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': props.borderColor,
            'line-width': 2,
        },
    },
];

const makePointStylePair = props => [
    {
        id: `pam-${props.featureType}-fill`,
        type: 'circle',
        minzoom: props.minzoom || 16,
        filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', 'user_featureType', props.featureType],
            ['==', '$type', 'Point'],
        ],
        paint: {
            'circle-radius': 9,
            'circle-color': props.borderColor,
        },
    },
    {
        id: `${props.featureType}-line`,
        type: 'circle',
        minzoom: props.minzoom || 16,
        filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', 'user_featureType', props.featureType],
            ['==', '$type', 'Point'],
        ],
        paint: {
            'circle-radius': 7,
            'circle-color': props.fillColor,
        },
    },
];

export const drawStyles = [
    ...makePolygonStylePair({
        featureType: 'footprint',
        fillColor: '#ffffff',
        borderColor: '#bdb3ac',
    }),
    ...makePolygonStylePair({
        featureType: 'building',
        fillColor: '#ffffff',
        borderColor: '#bdb3ac',
    }),
    ...makePolygonStylePair({
        featureType: 'kiosk',
        fillColor: '#ECEFFE',
        borderColor: '#C5CBE8',
    }),
    ...makePolygonStylePair({
        featureType: 'unit',
        fillColor: '#fff8eb',
        borderColor: '#e4d0bd',
    }),
    {
        id: `route-mesh-line`,
        type: 'line',
        minzoom: 19.5,
        filter: ['all', ['==', 'active', 'false'], ['==', 'user_featureType', 'routeSegment']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': '#909290',
            'line-width': 1,
            'line-dasharray': [4, 4],
        },
    },
    {
        id: `route-line`,
        type: 'line',
        minzoom: 15,
        filter: ['all', ['==', 'active', 'false'], ['==', 'id', 'route']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': '#6fb1ff',
            'line-width': 4,
            'line-dasharray': [2, 2],
        },
    },
    ...modifiedDefaultStyles,
    ...makePointStylePair({
        featureType: 'anchor',
        fillColor: '#00d035',
        borderColor: '#ffffff',
        minzoom: 19.5,
    }),
    ...makePointStylePair({
        featureType: 'routeNode',
        fillColor: '#757775',
        borderColor: '#bdb3ac',
        minzoom: 19.5,
    }),
    {
        id: 'pam-snap-guide',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'user_isSnapGuide', 'true']],
        layout: {
            'line-cap': 'round',
            'line-join': 'round',
        },
        paint: {
            'line-color': '#ff0000',
            'line-width': 1,
            'line-dasharray': [5, 5],
        },
    },
];
