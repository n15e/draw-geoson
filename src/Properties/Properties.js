import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem/ListItem';
import { withStyles } from '@material-ui/core';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import { FEATURE_TYPES } from '../imdfSpec';
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
    this.props.draw.setFeatureProperty(
      this.props.featureId,
      property,
      value,
    );
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

    const { feature } = this.state;
    const { classes } = this.props;

    const featureType = FEATURE_TYPES[feature.properties.featureType];

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
              name="ID"
              value={feature.id}
            />

            <PropertyRow
              name="Type"
              value={featureType.name}
            />

            {!!featureType.categories && (
              <PropertyRow
                name="Category"
                propertyName="category"
                value={feature.properties.category}
                options={Object.values(featureType.categories)}
                onChange={this.updateProperty}
              />
            )}

            {!!featureType.properties && featureType.properties.map(propertyName => (
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
    )
  }
}

Properties.propTypes = {
  featureId: PropTypes.string.isRequired,
  draw: PropTypes.any,
};

export default withStyles(styles)(Properties);
