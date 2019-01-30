import React from 'react';
import { withStyles } from '@material-ui/core';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Button from '@material-ui/core/es/Button/Button';
import Divider from '@material-ui/core/es/Divider/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TimelineIcon from '@material-ui/icons/Timeline';
import PlaceIcon from '@material-ui/icons/Place';
import ImageIcon from '@material-ui/icons/Image';
import SaveIcon from '@material-ui/icons/Save';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import Map from './Map/Map';
import './App.css';
import IconButton from '@material-ui/core/IconButton';
import ListItemSecondaryAction
  from '@material-ui/core/ListItemSecondaryAction';
import Properties from './Properties/Properties';
import { FEATURE_TYPES } from './imdfSpec';

const drawerWidth = 420;

const styles = () => ({
  app: {
    height: '100%',
    display: 'flex',
    alignItems: 'stretch',
  },
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
  map: {
    flex: 1,
    position: 'relative',
  },
});

class App extends React.PureComponent {
  state = {
    rotation: 0,
    map: null,
    draw: null,
    imageLayer: null,
    currentFeatureId: null,
  };

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

        this.state.draw.add(geojson);

        try {
          const firstFeature = rawGeojson.features[0];
          if (firstFeature.geometry.type === 'Point') {
            this.state.map.setCenter(firstFeature.geometry.coordinates);
          } else if (firstFeature.geometry.type === 'LineString') {
            this.state.map.setCenter(firstFeature.geometry.coordinates[0]);
          } else if (firstFeature.geometry.type === 'Polygon') {
            this.state.map.setCenter(firstFeature.geometry.coordinates[0][0]);
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
      this.setState({
        imageLayer: {
          name: file.name,
          imageFile: file,
          locked: false,
        }
      });
    } else if (file.name.endsWith('json')) {
      this.handleGeoJson(file);
    } else {
      window.alert(`${file.name} doesn't have a supported file type.`);
    }
  }

  toggleImageLayerLock = () => {
    this.setState(state => ({
      imageLayer: {
        ...state.imageLayer,
        locked: !state.imageLayer.locked,
      },
    }));
  };

  saveGeoJson = () => {
    const features = this.state.draw.getAll();
    const file = new Blob([JSON.stringify(features, null, 2)], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = 'my.geojson';
    a.click();
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.app}>
        <Map
          className={classes.map}
          rotation={this.state.rotation}
          onMapReady={({ draw, map, rotation }) => {
            this.setState({ draw, map, rotation });
          }}
          onRotationChange={rotation => {
            this.setState({ rotation });
          }}
          imageLayer={this.state.imageLayer}
          setCurrentFeature={currentFeatureId => {
            this.setState({currentFeatureId});
          }}
        />

        <Drawer
          variant="permanent"
          anchor="right"
          classes={{
            root: classes.drawer,
            paper: classes.drawerPaper,
          }}
        >
          <List>
            <ListItem>
              <ListItemText
                primary="Floorplan studio"
                classes={{
                  primary: classes.siteTitle,
                }}
              />
            </ListItem>

            <Divider />

            {!!this.state.map && (
              <React.Fragment>
                <ListItem>
                  <ListItemText
                    primary="Layers"
                    classes={{
                      primary: classes.sectionTitle,
                    }}
                  />
                </ListItem>

                {!!this.state.imageLayer && (
                  <ListItem>
                    <ListItemIcon>
                      <ImageIcon />
                    </ListItemIcon>

                    <ListItemText primary={this.state.imageLayer.name} />

                    <ListItemSecondaryAction>
                      <IconButton onClick={this.toggleImageLayerLock}>
                        {this.state.imageLayer.locked ? <LockIcon /> : <LockOpenIcon />}
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

                <ListItem>
                  <ListItemText
                    primary="Add features"
                    classes={{
                      primary: classes.sectionTitle,
                    }}
                  />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap_point', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.anchor.code,
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
                    this.state.draw.changeMode('snap_line', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.opening.code,
                    });
                  }}
                >
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>

                  <ListItemText primary={FEATURE_TYPES.opening.name} />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap_polygon', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.kiosk.code,
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
                    this.state.draw.changeMode('snap_polygon', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.unit.code,
                      category: FEATURE_TYPES.unit.categories.room.code,
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
                    this.state.draw.changeMode('snap_polygon', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.unit.code,
                      category: FEATURE_TYPES.unit.categories.restroom.code,
                    });
                  }}
                >
                  <ListItemIcon>
                    <AspectRatioIcon />
                  </ListItemIcon>

                  <ListItemText primary={FEATURE_TYPES.unit.categories.restroom.name} />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap_polygon', {
                      draw: this.state.draw,
                      featureType: FEATURE_TYPES.footprint.code,
                      category: FEATURE_TYPES.footprint.categories.ground.code,
                    });
                  }}
                >
                  <ListItemIcon>
                    <AspectRatioIcon />
                  </ListItemIcon>

                  <ListItemText primary={FEATURE_TYPES.footprint.name} />
                </ListItem>

                <Divider />

                {!!this.state.currentFeatureId && (
                  <React.Fragment>
                    <ListItem>
                      <ListItemText
                        primary="Properties"
                        classes={{
                          primary: classes.sectionTitle,
                        }}
                      />
                    </ListItem>

                    <Properties
                      featureId={this.state.currentFeatureId}
                      draw={this.state.draw}
                    />
                  </React.Fragment>
                )}

                <ListItem>
                  <ListItemText
                    primary="Other stuff"
                    classes={{
                      primary: classes.sectionTitle,
                    }}
                  />
                </ListItem>

                <ListItem>
                  <TextField
                    label="Map rotation"
                    variant="outlined"
                    type="number"
                    value={this.state.rotation}
                    inputProps={{ step: '0.1' }}
                    onChange={e => {
                      const rotation = Number(e.target.value || 0);
                      this.setState({rotation});
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
                    onChange={(e) => {
                      this.handleFile(e.target.files[0]);
                    }}
                  />
                </ListItem>

              </React.Fragment>
            )}
          </List>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles)(App);
