import React, {Component} from 'react';
import PropTypes from 'prop-types';
import PropertyRow from './PropertyRow';

class KioskProperties extends Component {
    render() {
        const allFeatures = this.props.draw.getAll();
        const unitIds = allFeatures.features
            .filter(feature => ['unit', 'kiosk'].includes(feature.properties.featureType))
            .map(feature => ({
                code: feature.id,
                name: feature.properties.name || feature.id,
            }));

        return (
            <React.Fragment>
                <PropertyRow
                    name="Linked unit"
                    propertyName="unit_id"
                    value={this.props.feature.properties.unit_id}
                    options={unitIds}
                    onChange={this.updateProperty}
                />
            </React.Fragment>
        );
    }
}

KioskProperties.propTypes = {
    classes: PropTypes.object,
    draw: PropTypes.any,
    feature: PropTypes.object.isRequired,
};

export default KioskProperties;
