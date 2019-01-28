import React from 'react';
import { withStyles } from '@material-ui/core';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import Button from '@material-ui/core/es/Button/Button';
import Divider from '@material-ui/core/es/Divider/Divider';
import Drawer from '@material-ui/core/Drawer';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PlaceIcon from '@material-ui/icons/Place';
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
  },
  buttonIcon: {
    marginRight: 8,
  },
});

class App extends React.PureComponent {
  state = {
    rotation: 0,
    map: null,
    draw: null,
  };

  fileUploadEl = React.createRef();

  handleFile(file) {
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
        } catch (err) {
          console.error(err);
        }
      };
      fileReader.readAsText(file);
    } catch(err) {
      console.error(err);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.app}>
        <Drawer
          variant="permanent"
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
                    <InsertDriveFileIcon className={classes.buttonIcon} />

                    Load from file
                  </Button>

                  {/* hidden input for file upload */}
                  <input
                    type="file"
                    accept=".json,.geojson"
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

        <Map
          className={classes.map}
          rotation={this.state.rotation}
          onMapReady={({ draw, map, rotation }) => {
            this.setState({ draw, map, rotation });
          }}
          onRotationChange={rotation => {
            this.setState({ rotation });
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(App);
