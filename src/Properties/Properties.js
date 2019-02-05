import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem/ListItem';
import {withStyles} from '@material-ui/core';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import {FEATURE_TYPES} from '../imdfSpec';
import PropertyRow from './PropertyRow';
import destinations from '../data/mockDestinations';
import * as mapUtils from '../Map/mapUtils';

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

    updateProperty = (property, value) => {
        mapUtils.setFeatureProperty(this.state.feature.id, property, value);

        this.setState(state => ({
            feature: {
                ...state.feature,
                properties: {
                    ...state.feature.properties,
                    [property]: value,
                },
            },
        }));

        mapUtils.renderLabels();
    };

    handleSelectionChange = ({features}) => {
        if (features.length !== 1) {
            this.setState({feature: null});
        } else {
            this.setState({feature: features[0]});
        }
    };

    componentDidMount() {
        const map = mapUtils.getMap();

        map.on('draw.selectionchange', this.handleSelectionChange);
    }

    componentWillUnmount() {
        mapUtils.getMap().off('draw.selectionchange', this.handleSelectionChange);
    }

    render() {
        const {feature} = this.state;
        const {classes} = this.props;

        // User can click on things that don't have a featureType
        if (!feature || !feature.properties.featureType) return null;

        const featureTypeDefinition = FEATURE_TYPES[feature.properties.featureType];

        return (
            <React.Fragment>
                <ListItem>
                    <ListItemText
                        primary="Properties"
                        classes={{
                            primary: classes.sectionTitle,
                        }}
                    />
                </ListItem>

                <ListItem className={classes.listItem}>
                    <Table className={classes.table} padding="none">
                        <TableBody>
                            {feature.properties.featureType === 'kiosk' && (
                                <PropertyRow
                                    name="Destination"
                                    propertyName="destinationId"
                                    value={feature.properties.destinationId || ''}
                                    options={destinations.map(destination => ({
                                        code: destination.id,
                                        name: destination.name,
                                    }))}
                                    native
                                    onChange={this.updateProperty}
                                />
                            )}

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
            </React.Fragment>
        );
    }
}

Properties.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(Properties);
