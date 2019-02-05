import React from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import Map from './Map/Map';
import Drawer from './Drawer/Drawer';
import destinations from './data/mockDestinations';

const styles = () => ({
    app: {
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
    },
    map: {
        flex: 1,
        position: 'relative',
    },
});

// TODO (davidg): think about where to store features.
//  option 1) the geojson object is handled by draw.
//  option 2) the geojson object lives in state
class App extends React.PureComponent {
    state = {
        rotation: 0,
        mapReady: false,
        imageLayer: null,
    };

    destinationMap = destinations.reduce((acc, destination) => {
        acc[destination.id] = destination.name;
        return acc;
    }, {});

    toggleImageLayerLock = () => {
        this.setState(state => ({
            imageLayer: {
                ...state.imageLayer,
                locked: !state.imageLayer.locked,
            },
        }));
    };

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.app}>
                <Map
                    className={classes.map}
                    imageLayer={this.state.imageLayer}
                    onMapReady={({rotation}) => {
                        this.setState({mapReady: true, rotation});
                    }}
                    onRotationChange={rotation => {
                        this.setState({rotation});
                    }}
                    rotation={this.state.rotation}
                />

                <Drawer
                    destinationMap={this.destinationMap}
                    imageLayer={this.state.imageLayer}
                    mapReady={this.state.mapReady}
                    onRotationChange={rotation => {
                        this.setState({rotation});
                    }}
                    rotation={this.state.rotation}
                    setImageLayer={imageLayer => {
                        this.setState({imageLayer});
                    }}
                    toggleImageLayerLock={this.toggleImageLayerLock}
                />
            </div>
        );
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
