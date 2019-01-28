import React from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SnapPolygonMode from './snapModes/SnapPolygonMode';
import SnapPointMode from './snapModes/SnapPointMode';
import SnapLineMode from './snapModes/SnapLineMode';
import customDrawStyles from './customDrawStyles';
import planUrl from './plan.jpg';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

mapboxGl.accessToken = 'pk.eyJ1IjoiZGF2aWRnNzA3IiwiYSI6ImNqZWVxaGtnazF2czAyeXFlcDlvY2kwZDQifQ.WSmiQO0ccl85_FvEDTsBmw';

class Map extends React.PureComponent {
  addPlan() {
    this.map.addSource('image-source', {
      type: 'image',
      url: planUrl,
      coordinates: [
        [-80.425, 46.437],
        [-71.516, 46.437],
        [-71.516, 37.936],
        [-80.425, 37.936]
      ]
    });

    this.map.addLayer({
      id: 'image-layer',
      type: 'raster',
      source: 'image-source',
      interactive: true,
      // paint: {
      //   'raster-opacity': 1,
      // }
    });

    // TODO (davidg): add four handles. Two resizers, two rotators.
    // I will assume a correct aspect ratio, so only need two of the
    // four coordinates (NE and SW or whatever) and can infer the other two
    // but if it's rotated, inferring the other two will be slippery
    // I'll also need an opacity control I guess, and the ability to delete
    // So probably it's time for a 'layers panel' concept

    this.map.on('click', 'image-layer', () => {
      console.log('click image-layer');
    });
    this.map.on('click', 'image-source', () => {
      console.log('click image-source');
    });
    this.map.on('click', e => {
      e.preventDefault();
      // e.stopPropagation();
      console.log('click map');
    });
  }

  renderMap() {
    this.map = new mapboxGl.Map({
      container: 'mapbox-snap-map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [-73.979582, 40.764116],
      zoom: 14.5,
      hash: true,
    });

    this.draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        snap_point: SnapPointMode,
        snap_polygon: SnapPolygonMode,
        snap_line: SnapLineMode,
      },
      styles: customDrawStyles,
      userProperties: true,
    });

    this.map.addControl(this.draw, 'top-right');
    this.map.addControl(new mapboxGl.NavigationControl(), 'top-right');

    this.map.on('load', () => {
      this.addPlan();

      this.props.onMapReady({
        map: this.map,
        draw: this.draw,
        rotation: this.map.getBearing(), // potentially set from the URL
      });
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
