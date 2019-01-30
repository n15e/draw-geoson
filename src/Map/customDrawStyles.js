import theme from '@mapbox/mapbox-gl-draw/src/lib/theme';

const modifiedDefaultStyles = theme.map(defaultStyle => {
  if (defaultStyle.id === 'gl-draw-line-inactive') {
    return {
      ...defaultStyle,
      filter: [
        ...defaultStyle.filter,
        ['!=', 'user_isSnapGuide', 'true'],
      ],
    };
  }

  if (defaultStyle.id.endsWith('-inactive')) {
    return {
      ...defaultStyle,
      filter: [
        ...defaultStyle.filter,
        ['!=', 'user_pam', 'true'],
      ],
    };
  }

  return defaultStyle;
});

const makeStylePair = props => [
  {
    id: `pam-${props.featureType}-fill`,
    type: 'fill',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', 'user_featureType', props.featureType],
    ],
    paint: {
      'fill-color': props.fillColor,
      'fill-outline-color': props.borderColor,
      'fill-opacity': 0.2
    }
  },
  {
    id: `${props.featureType}-line`,
    type: 'line',
    filter: ['all',
      ['==', 'active', 'false'],
      ['==', 'user_featureType', props.featureType],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': props.borderColor,
      'line-width': 2
    }
  },
];

const customDrawStyles = [
  {
    // Generic pam Polygon style
    'id': 'pam-base-polygon-fill',
    'type': 'fill',
    'filter': ['all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['==', 'user_pam', 'true'],
    ],
    'paint': {
      'fill-color': '#7a7a7a',
    }
  },
  ...makeStylePair({
    featureType: 'kiosk',
    fillColor: '#ECEFFE',
    borderColor: '#C5CBE8',
  }),
  ...makeStylePair({
    featureType: 'footprint',
    fillColor: '#ffffff',
    borderColor: '#bdb3ac',
  }),
  ...makeStylePair({
    featureType: 'unit',
    fillColor: '#fff8eb',
    borderColor: '#e4d0bd',
  }),
  ...modifiedDefaultStyles,
  {
    'id': 'pam-guide',
    'type': 'line',
    'filter': ['all',
      ['==', '$type', 'LineString'],
      ['==', 'user_isSnapGuide', 'true'],
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#ff0000',
      'line-width': 1,
      'line-dasharray': [5, 5],
    },
  },
];

export default customDrawStyles;
