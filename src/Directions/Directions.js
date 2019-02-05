import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select/Select';
import * as mapUtils from '../Map/mapUtils';

const styles = () => ({
    fullWidth: {
        width: '100%',
    },
});

class Directions extends React.PureComponent {
    state = {
        from: '',
        to: '',
    };

    updateDirections = () => {
        const {state} = this;

        if (!state.from || !state.to) mapUtils.drawShortestPath(null);

        // get all features
        // pluck out the two where the feature has a destinationId that matches to/from
        let startFeature = null;
        let endFeature = null;

        mapUtils.getAllFeatures().forEach(feature => {
            if (feature.properties.destinationId === state.from) {
                startFeature = feature;
            }
            if (feature.properties.destinationId === state.to) {
                endFeature = feature;
            }
        });

        mapUtils.drawShortestPath(startFeature, endFeature);
    };

    changeFrom = e => {
        this.setState({from: e.target.value}, () => {
            this.updateDirections();
        });
    };

    changeTo = e => {
        this.setState({to: e.target.value}, () => {
            this.updateDirections();
        });
    };

    render() {
        const {props, state} = this;

        // Get only the used destinations, not all of them
        const destinations = mapUtils
            .getAllFeatures()
            .filter(feature => feature.properties.destinationId)
            .map(feature => ({
                id: feature.properties.destinationId,
                name: props.destinationMap[feature.properties.destinationId],
            }));

        return (
            <React.Fragment>
                <ListItem>
                    <ListItemText primary="Directions" />
                </ListItem>

                <ListItem>
                    <Select
                        value={state.from}
                        onChange={this.changeFrom}
                        className={props.classes.fullWidth}
                        native
                    >
                        <React.Fragment>
                            <option value="">From</option>

                            {destinations.map(destination => {
                                if (destination.id === state.to) return null;
                                return (
                                    <option key={destination.id} value={destination.id}>
                                        {destination.name}
                                    </option>
                                );
                            })}
                        </React.Fragment>
                    </Select>
                </ListItem>

                <ListItem>
                    <Select
                        value={state.to}
                        onChange={this.changeTo}
                        className={props.classes.fullWidth}
                        native
                    >
                        <React.Fragment>
                            <option value="">To</option>

                            {destinations.map(destination => {
                                if (destination.id === state.from) return null;
                                return (
                                    <option key={destination.id} value={destination.id}>
                                        {destination.name}
                                    </option>
                                );
                            })}
                        </React.Fragment>
                    </Select>
                </ListItem>
            </React.Fragment>
        );
    }
}

Directions.propTypes = {
    classes: PropTypes.object.isRequired,
    destinationMap: PropTypes.object.isRequired,
};

export default withStyles(styles)(Directions);
