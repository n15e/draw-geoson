import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem/ListItem';
import {withStyles} from '@material-ui/core';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import {FEATURE_TYPES} from '../imdfSpec';
import PropertyRow from './PropertyRow';

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
        const feature = this.props.draw.get(this.props.featureId);
        this.setState({feature});
    }

    updateProperty = (property, value) => {
        this.props.draw.setFeatureProperty(this.props.featureId, property, value);
        this.setFeatureFromId();
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
        if (!this.state.feature) return null;

        const {feature} = this.state;
        const {classes} = this.props;

        const featureTypeDefinition = FEATURE_TYPES[feature.properties.featureType];

        // if (feature.properties.featureType === 'anchor') {
        //     const allFeatures = draw.getAll();
        //     const unitIds = allFeatures.features
        //         .filter(item => item.properties.featureType === 'unit')
        //         .map(unit => ({
        //             code: unit.id,
        //             name: unit.properties.name || unit.id,
        //         }));
        // }

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

                        <PropertyRow name="ID" value={feature.id} />

                        <PropertyRow name="Type" value={featureTypeDefinition.name} />

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

                        {/* {feature.properties.featureType === 'anchor' && ( */}
                        {/* <PropertyRow */}
                        {/* name="Linked unit" */}
                        {/* propertyName="unit_id" */}
                        {/* value={feature.properties.unit_id} */}
                        {/* options={getUnitIds()} */}
                        {/* onChange={this.updateProperty} */}
                        {/* /> */}
                        {/* )} */}

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
    draw: PropTypes.any,
    classes: PropTypes.object,
};

export default withStyles(styles)(Properties);
