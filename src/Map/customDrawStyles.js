import theme from '@mapbox/mapbox-gl-draw/src/lib/theme';

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

const customDrawStyles = [
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
    }),
    ...makePointStylePair({
        featureType: 'routeNode',
        fillColor: '#505250',
        borderColor: '#bdb3ac',
    }),
    {
        id: 'pam-guide',
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

export default customDrawStyles;
