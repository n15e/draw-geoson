import React from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import SnapMode from './SnapMode';
import RectangleMode from './RectangleMode';
import customDrawStyles from './customDrawStyles';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import styles from './Map.module.css';

mapboxGl.accessToken = 'pk.eyJ1IjoiZGF2aWRnNzA3IiwiYSI6ImNqZWVxaGtnazF2czAyeXFlcDlvY2kwZDQifQ.WSmiQO0ccl85_FvEDTsBmw';

class Map extends React.PureComponent {
  constructor(props) {
    super(props);

    this.mapEl = React.createRef();

    this.state = {
      mapReady: false,
    }
  }

  renderMap() {
    this.map = new mapboxGl.Map({
      container: this.mapEl.current,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [151.0778598, -33.825761],
      zoom: 15,
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

    this.map.addControl(this.draw, 'top-left');

    this.map.on('load', () => {
      this.setState({ mapReady: true })
    })
  }

  componentDidMount() {
    this.renderMap();
  }

  render() {
    return (
      <div className={styles.wrapper}>
        <div ref={this.mapEl} className={styles.map} />

        {this.state.mapReady && (
          <button className={styles.button} onClick={() => {
            this.draw.changeMode('snap', {
              features: this.draw.getAll().features,
              snapPx: 5,
            });
          }}>
            Snap mode!
          </button>
        )}
      </div>
    )
  }
}

export default Map;
