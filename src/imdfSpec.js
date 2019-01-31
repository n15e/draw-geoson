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
        properties: ['restriction', 'name'],
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
        // TODO (davidg): some of these will be drop downs (e.g. unit_id)
        //  and some will be just text, or different types. So trying to do it
        //  all here is probably not going to work very well.
        //  Instead I can just do <AnchorProperties> and <FootprintProperties> or whatever
        properties: ['address_id', 'unit_id', 'pam_space_id'],
    },
};
