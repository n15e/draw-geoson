import React from 'react';
import PropTypes from 'prop-types';
import { round } from '../snapModes/snapUtils';
import styles from './ImageLayer.module.css';

const getImageDimensions = async imageFile => {
  const objectUrl = URL.createObjectURL(imageFile);

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        height: img.height,
        width: img.width,
        objectUrl,
      });
    };

    img.src = objectUrl;
  });
};

class ImageLayer extends React.PureComponent {
  state = {
    ready: false,
    dragInProgress: false,
  };

  // TODO (davidg): unique source/layer name (not file.name)
  imageSourceId = 'image-source';
  rotationOnInsertion = 0;

  setPointsFromLatLngCoordinates() {
    const { map } = this.props;
    const coordinates = map.getSource(this.imageSourceId).coordinates;

    const nw = map.project(coordinates[0]);
    const se = map.project(coordinates[2]);
    const left = nw.x;
    const top = nw.y;
    const width = se.x - left;
    const height = se.y - top;

    this.setState({
      top,
      left,
      width,
      height,
    });
  }

  getLngLatCoordinatesFromPoints() {
    const { map } = this.props;
    const {
      top,
      left,
      width,
      height,
    } = this.state;

    const right = left + width;
    const bottom = top + height;

    // Get lat/lng for the four corners of the image
    const nw = map.unproject({ x: left, y: top });
    const ne = map.unproject({ x: right, y: top });
    const sw = map.unproject({ x: right, y: bottom });
    const se = map.unproject({ x: left, y: bottom });

    // This is the format that map.addSource() requires
    return [
      [nw.lng, nw.lat],
      [ne.lng, ne.lat],
      [sw.lng, sw.lat],
      [se.lng, se.lat],
    ];
  }

  updateLayersFromState() {
    const coordinates = this.getLngLatCoordinatesFromPoints();
    this.props.map.getSource(this.imageSourceId).setCoordinates(coordinates);
  }

  handleMouseMove = e => {
    // ignore mousemove events after mouseup
    if (!this.state.dragInProgress) return;

    if (this.currentHandle === 'move') {
      const deltaX = e.clientX - this.startX - this.cursorOffsetX;
      const deltaY = e.clientY - this.startY - this.cursorOffsetY;

      this.setState({
        left: this.startX + deltaX,
        top: this.startY + deltaY,
      });

      this.updateLayersFromState();

      return;
    }

    // Note, we ignore the y mouse position.
    // We change based on x, then resize to keep the image ratio the same
    const deltaX = e.clientX - this.startX - this.cursorOffsetX;

    if (this.currentHandle === 'nw') {
      const newWidth = this.startWidth - deltaX;
      const newHeight = newWidth * this.imageRatio;

      this.setState({
        left: this.startX + deltaX,
        top: this.startY + (this.startHeight - newHeight),
        width: newWidth,
        height: newHeight,
      });
    }

    if (this.currentHandle === 'ne') {
      const newWidth = this.startWidth + deltaX;
      const newHeight = newWidth * this.imageRatio;

      this.setState({
        top: this.startY + (this.startHeight - newHeight),
        width: newWidth,
        height: newHeight,
      });
    }

    if (this.currentHandle === 'se') {
      const newWidth = this.startWidth + deltaX;
      const newHeight = newWidth * this.imageRatio;

      this.setState({
        width: newWidth,
        height: newHeight,
      });
    }

    if (this.currentHandle === 'sw') {
      const newWidth = this.startWidth - deltaX;
      const newHeight = newWidth * this.imageRatio;

      this.setState({
        left: this.startX + deltaX,
        width: newWidth,
        height: newHeight,
      });
    }

    this.updateLayersFromState();
  };

  handleMouseUp = () => {
    this.setState({dragInProgress: false});
    this.currentHandle = null;

    this.updateLayersFromState();
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseDown = (e, handle) => {
    this.setState({dragInProgress: true});

    this.currentHandle = handle;
    this.cursorOffsetX = e.clientX - this.state.left;
    this.cursorOffsetY = e.clientY - this.state.top;

    this.startX = this.state.left;
    this.startY = this.state.top;
    this.startWidth = this.state.width;
    this.startHeight = this.state.height;

    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  };

  componentDidMount = async () => {
    const { map } = this.props;
    const canvas = map.getCanvas();
    this.rotationOnInsertion = round(map.getBearing(), 1);

    const fileData = await getImageDimensions(this.props.imageFile);

    this.imageRatio = fileData.height / fileData.width;

    // Scale image to take up 80% width
    // Doesn't really matter if it ends up being taller than the page height
    const left = canvas.offsetWidth * 0.1;
    const width = Math.min(fileData.width, canvas.offsetWidth  * 0.8);

    const scale = width / fileData.width;
    const top = canvas.offsetHeight * 0.1;
    const height = fileData.height * scale;

    this.setState({
      ready: true,
      currentRotation: this.rotationOnInsertion,
      top,
      left,
      width,
      height,
    });

    const coordinates = this.getLngLatCoordinatesFromPoints();

    // We want to insert our image layer below the mapbox-gl-draw layers
    const firstGlDrawLayer = map.getStyle().layers
      .find(
        layer => layer.source && layer.source.startsWith('mapbox-gl-draw')
      );
    const insertBefore = firstGlDrawLayer ? firstGlDrawLayer.id : undefined;

    map.addSource(this.imageSourceId, {
      type: 'image',
      url: fileData.objectUrl,
      coordinates,
    });

    map.addLayer({
      id: 'image-layer',
      type: 'raster',
      source: this.imageSourceId,
      paint: {
        'raster-opacity': 0.5,
      },
    }, insertBefore);

    map.on('move', () => {
      // Update the UI when the map moves
      if (!this.props.locked) {
        this.setPointsFromLatLngCoordinates();
        this.setState({currentRotation: round(map.getBearing(), 1)});
      }
    });
  };

  componentDidUpdate(prevProps) {
    if (this.props.locked !== prevProps.locked) {
      this.setPointsFromLatLngCoordinates();
    }
  }

  render() {
    if (this.props.locked) return null;
    if (!this.state.ready) return null;
    if (this.rotationOnInsertion !== this.state.currentRotation) return null;

    return (
      <React.Fragment>
        <div
          className={styles.background}
          style={{
            left: this.state.left,
            top: this.state.top,
            width: this.state.width,
            height: this.state.height,
          }}
          onMouseDown={e => {
            this.handleMouseDown(e, 'move');
          }}
        />
        <button
          className={styles.handle}
          style={{
            left: this.state.left,
            top: this.state.top,
            cursor: 'nw-resize',
            opacity: this.state.dragInProgress ? 0.1 : 1,
          }}
          onMouseDown={e => {
            this.handleMouseDown(e, 'nw');
          }}
        />
        <button
          className={styles.handle}
          style={{
            left: this.state.left + this.state.width,
            top: this.state.top,
            cursor: 'ne-resize',
            opacity: this.state.dragInProgress ? 0.1 : 1,
          }}
          onMouseDown={e => {
            this.handleMouseDown(e, 'ne');
          }}
        />
        <button
          className={styles.handle}
          style={{
            left: this.state.left + this.state.width,
            top: this.state.top + this.state.height,
            cursor: 'se-resize',
            opacity: this.state.dragInProgress ? 0.1 : 1,
          }}
          onMouseDown={e => {
            this.handleMouseDown(e, 'se');
          }}
        />
        <button
          className={styles.handle}
          style={{
            left: this.state.left,
            top: this.state.top + this.state.height,
            cursor: 'sw-resize',
            opacity: this.state.dragInProgress ? 0.1 : 1,
          }}
          onMouseDown={e => {
            this.handleMouseDown(e, 'sw');
          }}
        />
      </React.Fragment>
    )
  }
}

ImageLayer.propTypes = {
  imageFile: PropTypes.any,
};

export default ImageLayer;
