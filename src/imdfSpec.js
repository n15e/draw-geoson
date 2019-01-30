export const FEATURE_TYPES = {
    unit: {
        name: 'Unit',
        code: 'unit',
        categories: {
            conferenceroom: {name: 'Conference room', code: 'conferenceroom'},
            elevator: {name: 'Elevator', code: 'elevator'},
            lobby: {name: 'Lobby', code: 'lobby'},
            restroom: {name: 'Restroom', code: 'restroom'},
            'restroom.female': {name: 'Restroom - female', code: 'restroom.female'},
            'restroom.male': {name: 'Restroom - male', code: 'restroom.male'},
            room: {name: 'Room', code: 'room'},
        },
        properties: [],
    },
    venue: {
        name: 'Venue',
        code: 'venue',
        categories: null,
        properties: [],
    },
    kiosk: {
        name: 'Kiosk',
        code: 'kiosk',
        categories: null,
        properties: ['anchor_id', 'pam_space_id'],
    },
    footprint: {
        name: 'Footprint',
        code: 'footprint',
        categories: {
            aerial: {name: 'Aerial', code: 'aerial'},
            ground: {name: 'Ground', code: 'ground'},
            subterranean: {name: 'Subterranean', code: 'subterranean'},
        },
        properties: ['pam_building_id'],
    },
    opening: {
        name: 'Opening',
        code: 'opening',
        categories: null,
        properties: [],
    },
    anchor: {
        name: 'Anchor',
        code: 'anchor',
        categories: null,
        properties: ['address_id', 'unit_id', 'pam_space_id'],
    },
};
