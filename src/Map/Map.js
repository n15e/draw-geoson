import React from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SnapMode from './SnapMode';
import RectangleMode from './RectangleMode';
import customDrawStyles from './customDrawStyles';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

mapboxGl.accessToken = 'pk.eyJ1IjoiZGF2aWRnNzA3IiwiYSI6ImNqZWVxaGtnazF2czAyeXFlcDlvY2kwZDQifQ.WSmiQO0ccl85_FvEDTsBmw';

class Map extends React.PureComponent {
  renderMap() {
    this.map = new mapboxGl.Map({
      container: 'mapbox-snap-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [151.077, -33.825],
      zoom: 15,
      bearing: this.props.rotation,
    });

    this.draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        snap: SnapMode,
        rectangle: RectangleMode,
      },
      styles: customDrawStyles,
      userProperties: true,
    });

    this.map.addControl(this.draw, 'top-right');
    this.map.addControl(new mapboxGl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      this.props.onMapReady({ map: this.map, draw: this.draw });
    });

    this.map.on('rotate', () => {
      const bearing = this.map.getBearing();

      if (bearing !== this.props.rotation) {
        this.props.onRotationChange(Math.round(bearing * 1000) / 1000);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.rotation !== prevProps.rotation) {
      this.map.setBearing(this.props.rotation)
    }
  }

  componentDidMount() {
    this.renderMap();
  }

  render() {
    return (
      <div id="mapbox-snap-map" className={this.props.className} />
    );
  }
}

export default Map;