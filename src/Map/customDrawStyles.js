import theme from '@mapbox/mapbox-gl-draw/src/lib/theme';

const modifiedDefaultStyles = theme.map(defaultStyle => {
    if (defaultStyle.id === 'gl-draw-line-inactive') {
        return {
            ...defaultStyle,
            filter: [...defaultStyle.filter, ['!=', 'user_isSnapGuide', 'true']],
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
            'fill-opacity': 0.9,
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
            'circle-color': '#fff',
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
            'circle-color': '#1cd000',
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
    ...makePointStylePair({
        featureType: 'anchor',
        fillColor: '#fff8eb',
        borderColor: '#e4d0bd',
    }),
    ...modifiedDefaultStyles,
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
