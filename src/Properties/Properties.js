import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem/ListItem';
import {withStyles} from '@material-ui/core';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import {FEATURE_TYPES} from '../imdfSpec';
import PropertyRow from './PropertyRow';
import destinations from '../data/mockDestinations';
import * as mapUtils from '../Map/mapUtils';
// import KioskProperties from './KioskProperties';

const styles = {
    listItem: {
        paddingLeft: 8,
        paddingRight: 8,
    },
    table: {
        width: '100%',
        tableLayout: 'fixed',
        fontSize: 16,
    },
    row: {
        height: 32,
    },
    cell: {
        padding: '0 8px !important',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    firstCol: {
        width: '40%',
    },
    fullWidth: {
        width: '100%',
    },
};

class Properties extends Component {
    state = {
        feature: null,
    };

    setFeatureFromId() {
        this.setState({
            feature: mapUtils.getFeature(this.props.featureId),
        });
    }

    updateProperty = (property, value) => {
        mapUtils.setFeatureProperty(this.props.featureId, property, value);
        this.setFeatureFromId();

        // this.props.onPropertyChange();
        mapUtils.updateLabels();
    };

    componentDidMount() {
        this.setFeatureFromId();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.featureId !== this.props.featureId) {
            this.setFeatureFromId();
        }
    }

    render() {
        const {feature} = this.state;
        const {classes} = this.props;

        // User can click on things that don't have a featureType
        if (!feature || !feature.properties.featureType) return null;

        const featureTypeDefinition = FEATURE_TYPES[feature.properties.featureType];

        return (
            <ListItem className={classes.listItem}>
                <Table className={classes.table} padding="none">
                    <TableBody>
                        <PropertyRow
                            name="Name"
                            propertyName="name"
                            value={feature.properties.name || ''}
                            editable
                            onChange={this.updateProperty}
                        />

                        <PropertyRow
                            name="Importance"
                            propertyName="weight"
                            value={feature.properties.weight || 0}
                            editable
                            onChange={(property, value) => {
                                const num = Number(value);

                                if (!Number.isNaN(num)) {
                                    this.updateProperty(property, value);
                                } else {
                                    this.updateProperty(property, 0);
                                }
                            }}
                        />

                        <PropertyRow name="ID" value={feature.id} />

                        <PropertyRow name="Type" value={featureTypeDefinition.name} />
                        <PropertyRow
                            name="display_point"
                            value={JSON.stringify(feature.properties.display_point)}
                        />

                        {feature.properties.featureType === 'kiosk' && (
                            <PropertyRow
                                name="Destination"
                                propertyName="destination"
                                value={feature.properties.destinationId || ''}
                                options={destinations.map(destination => ({
                                    code: destination.id,
                                    name: destination.name,
                                }))}
                                onChange={(property, value) => {
                                    const selectedDestination = destinations.find(
                                        destination => destination.id === value
                                    );

                                    this.updateProperty('destinationId', selectedDestination.id);
                                    this.updateProperty(
                                        'destinationName',
                                        selectedDestination.name
                                    );
                                }}
                            />
                        )}

                        {feature.geometry.type === 'Point' && (
                            <React.Fragment>
                                <PropertyRow
                                    name="Latitude"
                                    value={feature.geometry.coordinates[1]}
                                />
                                <PropertyRow
                                    name="Longitude"
                                    value={feature.geometry.coordinates[0]}
                                />
                            </React.Fragment>
                        )}

                        {!!featureTypeDefinition.categories && (
                            <PropertyRow
                                name="Category"
                                propertyName="category"
                                value={feature.properties.category}
                                options={Object.values(featureTypeDefinition.categories)}
                                onChange={this.updateProperty}
                            />
                        )}

                        {!!featureTypeDefinition.properties &&
                            featureTypeDefinition.properties.map(propertyName => (
                                <PropertyRow
                                    name={propertyName}
                                    key={propertyName}
                                    propertyName={propertyName}
                                    value={feature.properties[propertyName] || ''}
                                    editable
                                    onChange={this.updateProperty}
                                />
                            ))}
                    </TableBody>
                </Table>
            </ListItem>
        );
    }
}

Properties.propTypes = {
    featureId: PropTypes.string.isRequired,
    classes: PropTypes.object,
    onPropertyChange: PropTypes.func,
};

export default withStyles(styles)(Properties);
