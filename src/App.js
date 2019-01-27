import React from 'react';
import { withStyles } from '@material-ui/core';
import Divider from '@material-ui/core/es/Divider/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import PlaceIcon from '@material-ui/icons/Place';
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
});

const getRotation = () => {
  const rotation = window.localStorage.rotation;
  return rotation ? Number(rotation) : 0;
};

const setRotation = rotation => {
  window.localStorage.rotation = rotation;
};

class App extends React.PureComponent {
  state = {
    rotation: getRotation(),
    map: null,
    draw: null,
  };

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

                <ListItem button disabled >
                  <ListItemIcon>
                    <PlaceIcon />
                  </ListItemIcon>

                  <ListItemText primary="Snappy point" />
                </ListItem>

                <ListItem button disabled >
                  <ListItemIcon>
                    <TimelineIcon />
                  </ListItemIcon>

                  <ListItemText primary="Snappy line" />
                </ListItem>

                <ListItem
                  button
                  onClick={() => {
                    this.state.draw.changeMode('snap', {
                      draw: this.state.draw,
                      snapPx: 10,
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

                      setRotation(rotation)
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
          onMapReady={({ draw, map }) => {
            this.setState({ draw, map });
          }}
          onRotationChange={rotation => {
            this.setState({ rotation });
            setRotation(rotation);
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(App);
