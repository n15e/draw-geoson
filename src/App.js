import React from 'react';
import { withStyles } from '@material-ui/core';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Button from '@material-ui/core/es/Button/Button';
import Divider from '@material-ui/core/es/Divider/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PlaceIcon from '@material-ui/icons/Place';
import ImageIcon from '@material-ui/icons/Image';
import TextField from '@material-ui/core/TextField';
import TimelineIcon from '@material-ui/icons/Timeline';
import Map from './Map/Map';
import './App.css';

const drawerWidth = 280;

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
    layers: [],
    currentLayerId: null,
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
      const id = Math.random();

      this.setState(state => ({
        currentLayerId: id,
        layers: [
          ...state.layers,
          {
            id,
            type: 'image',
            name: file.name,
            imageFile: file,
            active: true,
          }
        ]
      }));
    } else if (file.name.endsWith('json')) {
      this.handleGeoJson(file);
    } else {
      window.alert(`${file.name} doesn't have a supported file type.`);
    }
  }

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
          layers={this.state.layers}
          currentLayerId={this.state.currentLayerId}
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
                primary="Draw GeoJson"
                classes={{
                  primary: classes.siteTitle,
                }}
              />
            </ListItem>

            {!!this.state.map && (
              <React.Fragment>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Layers"
                    classes={{
                      primary: classes.sectionTitle,
                    }}
                  />
                </ListItem>

                {!!this.state.layers.length ? this.state.layers.map(layer => (
                  <ListItem
                    key={layer.id}
                    button
                    onClick={() => {
                      console.log('activating layer:', layer);
                      this.setState({
                        currentLayerId: layer.id,
                      })
                    }}
                  >
                    <ListItemIcon>
                      {layer.type === 'image' ? <ImageIcon /> : null}
                    </ListItemIcon>

                    <ListItemText primary={layer.name} />
                  </ListItem>
                )) : <ListItem />}

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Tools"
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
                    });
                  }}
                >
                  <ListItemIcon>
                    <PlaceIcon />
                  </ListItemIcon>

                  <ListItemText primary="Snappy point" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap_line', {
                      draw: this.state.draw,
                    });
                  }}
                >
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>

                  <ListItemText primary="Snappy line" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap_polygon', {
                      draw: this.state.draw,
                    });
                  }}
                >
                  <ListItemIcon>
                    <AspectRatioIcon />
                  </ListItemIcon>

                  <ListItemText primary="Snappy polygon" />
                </ListItem>

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Controls"
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

                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Import/export"
                    classes={{
                      primary: classes.sectionTitle,
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
