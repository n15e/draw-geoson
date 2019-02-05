import React from 'react';
import * as PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Button from '@material-ui/core/es/Button/Button';
import Divider from '@material-ui/core/es/Divider/Divider';
import MdDrawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ImageIcon from '@material-ui/icons/Image';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import PlaceIcon from '@material-ui/icons/Place';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';
import TimelineIcon from '@material-ui/icons/Timeline';
import Properties from '../Properties/Properties';
import {FEATURE_TYPES} from '../imdfSpec';
import Directions from '../Directions/Directions';
import * as mapUtils from '../Map/mapUtils';

const drawerWidth = 420;

const styles = () => ({
    drawer: {
        width: drawerWidth,
        flex: 'none',
    },
    drawerPaper: {
        width: drawerWidth,
    },
    siteTitle: {
        fontSize: 30,
    },
    sectionTitle: {
        fontSize: 22,
    },
});

class Drawer extends React.PureComponent {
    fileUploadEl = React.createRef();

    handleGeoJson(file) {
        try {
            const fileReader = new FileReader();

            fileReader.onload = e => {
                const rawGeojson = JSON.parse(e.target.result);

                // Strip out potential junk like a crs prop that Mapbox won't like
                const geojson = {
                    features: rawGeojson.features,
                    type: rawGeojson.type,
                };

                mapUtils.getDraw().add(geojson);

                try {
                    const firstFeature = rawGeojson.features[0];
                    if (firstFeature.geometry.type === 'Point') {
                        mapUtils.setMapCenter(firstFeature.geometry.coordinates);
                    } else if (firstFeature.geometry.type === 'LineString') {
                        mapUtils.setMapCenter(firstFeature.geometry.coordinates[0]);
                    } else if (firstFeature.geometry.type === 'Polygon') {
                        mapUtils.setMapCenter(firstFeature.geometry.coordinates[0][0]);
                    }
                    // TODO (davidg): get bbox and zoom, or whatever
                    // TODO (davidg): set rotate based on dominant angle
                } catch (err) {
                    console.error(err);
                }
            };
            fileReader.readAsText(file);
        } catch (err) {
            console.error(err);
        }
    }

    handleFile(file) {
        if (!file) return;

        if (file.type.startsWith('image/')) {
            this.props.setImageLayer({
                name: file.name,
                imageFile: file,
                locked: false,
            });
        } else if (file.name.endsWith('json')) {
            this.handleGeoJson(file);
        } else {
            // eslint-disable-next-line no-alert
            window.alert(`${file.name} doesn't have a supported file type.`);
        }
    }

    saveGeoJson = () => {
        const features = mapUtils.getAllAsFeatureCollection();

        const file = new Blob([JSON.stringify(features, null, 2)], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = 'my.geojson';
        a.click();
    };

    render() {
        const {props} = this;

        return (
            <MdDrawer
                variant="permanent"
                anchor="right"
                classes={{
                    root: props.classes.drawer,
                    paper: props.classes.drawerPaper,
                }}
            >
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Floorplan studio"
                            classes={{
                                primary: props.classes.siteTitle,
                            }}
                        />
                    </ListItem>

                    <Divider />

                    {!!props.mapReady && (
                        <React.Fragment>
                            <ListItem>
                                <ListItemText
                                    primary="Layers"
                                    classes={{
                                        primary: props.classes.sectionTitle,
                                    }}
                                />
                            </ListItem>

                            {!!props.imageLayer && (
                                <ListItem>
                                    <ListItemIcon>
                                        <ImageIcon />
                                    </ListItemIcon>

                                    <ListItemText primary={props.imageLayer.name} />

                                    <ListItemSecondaryAction>
                                        <IconButton onClick={props.toggleImageLayerLock}>
                                            {props.imageLayer.locked ? (
                                                <LockIcon />
                                            ) : (
                                                <LockOpenIcon />
                                            )}
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )}

                            <ListItem>
                                <ListItemIcon>
                                    <TimelineIcon />
                                </ListItemIcon>

                                <ListItemText primary="GeoJson" />

                                <ListItemSecondaryAction>
                                    <IconButton onClick={this.saveGeoJson}>
                                        <SaveIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>

                            <Divider />

                            <Directions destinationMap={props.destinationMap} />

                            <Divider />

                            <ListItem>
                                <ListItemText
                                    primary="Add features"
                                    classes={{
                                        primary: props.classes.sectionTitle,
                                    }}
                                />
                            </ListItem>

                            <ListItem
                                button
                                onClick={() => {
                                    mapUtils.changeDrawMode('snap_point', {
                                        properties: {
                                            featureType: FEATURE_TYPES.anchor.code,
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <PlaceIcon />
                                </ListItemIcon>

                                <ListItemText primary={FEATURE_TYPES.anchor.name} />
                            </ListItem>

                            <ListItem
                                button
                                onClick={() => {
                                    mapUtils.changeDrawMode('snap_line', {
                                        properties: {
                                            featureType: FEATURE_TYPES.routeSegment.code,
                                        },
                                        snapFilter: feature =>
                                            feature.properties.featureType ===
                                            FEATURE_TYPES.routeSegment.code,
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <TimelineIcon />
                                </ListItemIcon>

                                <ListItemText primary={FEATURE_TYPES.routeSegment.name} />
                            </ListItem>

                            <ListItem
                                button
                                onClick={() => {
                                    mapUtils.changeDrawMode('snap_polygon', {
                                        properties: {
                                            featureType: FEATURE_TYPES.kiosk.code,
                                            name: '',
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <AspectRatioIcon />
                                </ListItemIcon>

                                <ListItemText primary={FEATURE_TYPES.kiosk.name} />
                            </ListItem>

                            <ListItem
                                button
                                onClick={() => {
                                    mapUtils.changeDrawMode('snap_polygon', {
                                        properties: {
                                            featureType: FEATURE_TYPES.unit.code,
                                            category: FEATURE_TYPES.unit.categories.room.code,
                                            name: '',
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <AspectRatioIcon />
                                </ListItemIcon>

                                <ListItemText primary={FEATURE_TYPES.unit.categories.room.name} />
                            </ListItem>

                            <ListItem
                                button
                                onClick={() => {
                                    mapUtils.changeDrawMode('snap_polygon', {
                                        properties: {
                                            featureType: FEATURE_TYPES.footprint.code,
                                            category:
                                                FEATURE_TYPES.footprint.categories.ground.code,
                                            name: '',
                                        },
                                    });
                                }}
                            >
                                <ListItemIcon>
                                    <AspectRatioIcon />
                                </ListItemIcon>

                                <ListItemText primary={FEATURE_TYPES.footprint.name} />
                            </ListItem>

                            <Divider />

                            <Properties />

                            <ListItem>
                                <ListItemText
                                    primary="Other stuff"
                                    classes={{
                                        primary: props.classes.sectionTitle,
                                    }}
                                />
                            </ListItem>

                            <ListItem>
                                <TextField
                                    label="Map rotation"
                                    variant="outlined"
                                    type="number"
                                    value={props.rotation}
                                    inputProps={{step: '0.1'}}
                                    onChange={e => {
                                        const rotation = Number(e.target.value || 0);
                                        props.onRotationChange(rotation);
                                    }}
                                />
                            </ListItem>

                            <ListItem>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        this.fileUploadEl.current.click();
                                    }}
                                >
                                    Load image or geojson
                                </Button>

                                {/* hidden input for file upload */}
                                <input
                                    type="file"
                                    accept=".json,.geojson,image/*"
                                    ref={this.fileUploadEl}
                                    hidden
                                    onChange={e => {
                                        this.handleFile(e.target.files[0]);
                                    }}
                                />
                            </ListItem>
                        </React.Fragment>
                    )}
                </List>
            </MdDrawer>
        );
    }
}

Drawer.propTypes = {
    classes: PropTypes.object.isRequired,
    destinationMap: PropTypes.object.isRequired,
    imageLayer: PropTypes.object,
    mapReady: PropTypes.bool.isRequired,
    onRotationChange: PropTypes.func.isRequired,
    rotation: PropTypes.number.isRequired,
    setImageLayer: PropTypes.func.isRequired,
    toggleImageLayerLock: PropTypes.func.isRequired,
};

export default withStyles(styles)(Drawer);
