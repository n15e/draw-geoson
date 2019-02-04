import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/es/MenuItem/MenuItem';
import * as mapUtils from '../Map/mapUtils';

const styles = () => ({});

// TODO (davidg): this can hold its own state, I don't think it even needs to
//  talk to the parent component
class Directions extends React.PureComponent {
    render() {
        const {props} = this;
        const destinations = mapUtils
            .getAllFeatures()
            .filter(feature => feature.properties.destinationId)
            .map(feature => ({
                id: feature.properties.destinationId,
                name: feature.properties.destinationName,
            }));

        return (
            <React.Fragment>
                <ListItem>
                    <ListItemText primary="Directions" />
                </ListItem>

                <ListItem>
                    From:
                    <Select
                        value={this.props.from || ''}
                        onChange={e => {
                            props.onChangeFrom(e.target.value);
                        }}
                        className={props.classes.fullWidth}
                    >
                        {destinations.map(destination => (
                            <MenuItem key={destination.id} value={destination.id}>
                                {destination.name}
                            </MenuItem>
                        ))}
                    </Select>
                </ListItem>

                <ListItem>
                    To:
                    <Select
                        value={this.props.to || ''}
                        onChange={e => {
                            props.onChangeTo(e.target.value);
                        }}
                        className={props.classes.fullWidth}
                    >
                        {destinations.map(destination => (
                            <MenuItem key={destination.id} value={destination.id}>
                                {destination.name}
                            </MenuItem>
                        ))}
                    </Select>
                </ListItem>
            </React.Fragment>
        );
    }
}

Directions.propTypes = {
    classes: PropTypes.object.isRequired,
    // draw: PropTypes.object.isRequired,
    from: PropTypes.string,
    to: PropTypes.string,
    onChangeFrom: PropTypes.func.isRequired,
    onChangeTo: PropTypes.func.isRequired,
};

export default withStyles(styles)(Directions);
