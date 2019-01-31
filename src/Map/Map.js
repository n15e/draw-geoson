import React from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import ImageLayer from './ImageLayer/ImageLayer';
import SnapPolygonMode from './snapModes/SnapPolygonMode';
import SnapPointMode from './snapModes/SnapPointMode';
import SnapLineMode from './snapModes/SnapLineMode';
import customDrawStyles from './customDrawStyles';
import {makeFeature, round} from './snapModes/snapUtils';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxGl.accessToken =
    'pk.eyJ1IjoiZGF2aWRnNzA3IiwiYSI6ImNqZWVxaGtnazF2czAyeXFlcDlvY2kwZDQifQ.WSmiQO0ccl85_FvEDTsBmw';

// const mockData = {
//     type: 'FeatureCollection',
//     features: [
//         {
//             id: '714b1afc-6b36-4ceb-b4ba-a987a5694430',
//             type: 'Feature',
//             properties: {
//                 featureType: 'anchor',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [-115.17358705767026, 36.08692486396957],
//                 type: 'Point',
//             },
//         },
//         {
//             id: '680e0e97-c153-4ec9-9bf7-fa0f5a25e4eb',
//             type: 'Feature',
//             properties: {
//                 featureType: 'anchor',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [-115.17873410176405, 36.088069169792846],
//                 type: 'Point',
//             },
//         },
//         {
//             id: 'ae55f720-f89b-41ab-819b-f9ee9c63f5f3',
//             type: 'Feature',
//             properties: {
//                 featureType: 'anchor',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [-115.1760841, 36.0868044],
//                 type: 'Point',
//             },
//         },
//         {
//             id: 'd7ecd09e-52dd-48fb-a28e-5809850e7445',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1738005, 36.0871515],
//                         [-115.1739049, 36.0871515],
//                         [-115.1739049, 36.0872366],
//                         [-115.1738005, 36.0872366],
//                         [-115.1738005, 36.0871515],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'eb9d6374-693d-4d2b-92a3-b2bded128fae',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1739352, 36.0871515],
//                         [-115.1740042, 36.0871515],
//                         [-115.1740042, 36.0872366],
//                         [-115.1739352, 36.0872366],
//                         [-115.1739352, 36.0871515],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '0efc560e-7164-4a9e-827b-e76abdfddc65',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1739688, 36.0870133],
//                         [-115.1740042, 36.0870133],
//                         [-115.1740042, 36.0870985],
//                         [-115.1739688, 36.0870985],
//                         [-115.1739688, 36.0870133],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'e1ca4e0e-f0f3-46df-bfd2-2f9924da359f',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1738359, 36.0872603],
//                         [-115.1739049, 36.0872603],
//                         [-115.1739049, 36.0873182],
//                         [-115.1738359, 36.0873182],
//                         [-115.1738359, 36.0872603],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'dd17949d-d2b6-46c9-a048-7469a8ec40fb',
//             type: 'Feature',
//             properties: {
//                 featureType: 'kiosk',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1738359, 36.0873419],
//                         [-115.1739049, 36.0873419],
//                         [-115.1739049, 36.0873984],
//                         [-115.1738359, 36.0873984],
//                         [-115.1738359, 36.0873419],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '0d7d62e7-99f1-4394-b5d9-43c965e4c843',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1744402, 36.087478],
//                         [-115.1748235, 36.087478],
//                         [-115.1748235, 36.087614],
//                         [-115.1744402, 36.087614],
//                         [-115.1744402, 36.087478],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'ce3a9dbb-db70-497f-a9bc-29e54c7d2625',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1738359, 36.0876698],
//                         [-115.1748235, 36.0876698],
//                         [-115.1748235, 36.0879977],
//                         [-115.1738359, 36.0879977],
//                         [-115.1738359, 36.0876698],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'd0cd0be9-76ae-4a08-989f-b9df27b08ba3',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1737323, 36.0871512],
//                         [-115.1737323, 36.0872363],
//                         [-115.1737712, 36.0872363],
//                         [-115.1737712, 36.0871512],
//                         [-115.1737323, 36.0871512],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '5e8e32be-eb4e-4ed1-b997-e0e83890bf4d',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1744403, 36.0873981],
//                         [-115.1745438, 36.0873981],
//                         [-115.1745438, 36.0874525],
//                         [-115.1744403, 36.0874525],
//                         [-115.1744403, 36.0873981],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '87112540-28c6-4306-9dd4-8460b35c0273',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1748238, 36.0879977],
//                         [-115.1748238, 36.0882237],
//                         [-115.1743015, 36.0882237],
//                         [-115.1743015, 36.0879977],
//                         [-115.1748238, 36.0879977],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'eb1a050f-b2cf-4e76-bdae-0d1f3f371068',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1740366, 36.0870135],
//                         [-115.1740722, 36.0870135],
//                         [-115.1740722, 36.0870988],
//                         [-115.1740366, 36.0870988],
//                         [-115.1740366, 36.0870135],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '56077b2a-923c-4a1c-b511-6f50b98d2220',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.174106, 36.0870132],
//                         [-115.1742097, 36.0870132],
//                         [-115.1742097, 36.0870983],
//                         [-115.174106, 36.0870983],
//                         [-115.174106, 36.0870132],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'ef9032f9-380b-4b7e-ae2f-3f714797b312',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1742404, 36.0870132],
//                         [-115.1743104, 36.0870132],
//                         [-115.1743104, 36.0870714],
//                         [-115.1742404, 36.0870714],
//                         [-115.1742404, 36.0870132],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '1b1d3fe2-f86e-4331-9dd1-87144e23204c',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1743407, 36.0870132],
//                         [-115.1744098, 36.0870132],
//                         [-115.1744098, 36.0870714],
//                         [-115.1743407, 36.0870714],
//                         [-115.1743407, 36.0870132],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '96b83665-0163-407b-8286-c49e903f1424',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1744431, 36.0870132],
//                         [-115.1746129, 36.0870132],
//                         [-115.1746129, 36.0870714],
//                         [-115.1744431, 36.0870714],
//                         [-115.1744431, 36.0870132],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'd6d1d5f8-b14c-4f40-b7f5-b43734ae27c9',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1748566, 36.0870134],
//                         [-115.1749253, 36.0870134],
//                         [-115.1749253, 36.0871262],
//                         [-115.1748566, 36.0871262],
//                         [-115.1748566, 36.0870134],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '354605ae-a4ad-418b-aa2b-b53209042a82',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1748566, 36.0871528],
//                         [-115.1749253, 36.0871528],
//                         [-115.1749253, 36.0872078],
//                         [-115.1748566, 36.0872078],
//                         [-115.1748566, 36.0871528],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'd406aa14-5887-411e-bfb1-ec9d7a1923f9',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1748566, 36.0872315],
//                         [-115.1749253, 36.0872315],
//                         [-115.1749253, 36.0872639],
//                         [-115.1748566, 36.0872639],
//                         [-115.1748566, 36.0872315],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'f872d913-dc0b-479a-b9ea-00294943b57a',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1747542, 36.0872882],
//                         [-115.1749253, 36.0872882],
//                         [-115.1749253, 36.087372],
//                         [-115.1747542, 36.087372],
//                         [-115.1747542, 36.0872882],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'e6637ba7-22a3-4c62-81f4-d0db0410e446',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1747213, 36.0873981],
//                         [-115.17479, 36.0873981],
//                         [-115.17479, 36.0874524],
//                         [-115.1747213, 36.0874524],
//                         [-115.1747213, 36.0873981],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'd684be52-1e88-4872-ac4d-babef028c083',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1749591, 36.087013],
//                         [-115.1750285, 36.087013],
//                         [-115.1750285, 36.0870988],
//                         [-115.1749935, 36.0870988],
//                         [-115.1749935, 36.0871261],
//                         [-115.1749591, 36.0871261],
//                         [-115.1749591, 36.087013],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '11294b64-1972-43c9-862b-e1838bdc0e71',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1749591, 36.0871528],
//                         [-115.1750285, 36.0871528],
//                         [-115.1750285, 36.087288],
//                         [-115.1749591, 36.087288],
//                         [-115.1749591, 36.0871528],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '469c8436-cf9d-4a9d-9766-d5e3dd5cf307',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1747542, 36.087013],
//                         [-115.1748236, 36.087013],
//                         [-115.1748236, 36.0870988],
//                         [-115.1747899, 36.0870988],
//                         [-115.1747899, 36.0871261],
//                         [-115.1747542, 36.0871261],
//                         [-115.1747542, 36.087013],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: '96663233-c9c6-4e8f-a300-dc236cc6b574',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1751603, 36.0870417],
//                         [-115.1752296, 36.0870417],
//                         [-115.1752296, 36.0870985],
//                         [-115.1751945, 36.0870985],
//                         [-115.1751945, 36.0871261],
//                         [-115.1751603, 36.0871261],
//                         [-115.1751603, 36.0870417],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'aaee9afd-b6aa-45b1-9920-c8a149bc47d9',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1751603, 36.087153],
//                         [-115.1752296, 36.087153],
//                         [-115.1752296, 36.0872075],
//                         [-115.1751603, 36.0872075],
//                         [-115.1751603, 36.087153],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'ae770825-47ce-4508-afb5-836398fa0577',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1751603, 36.0872314],
//                         [-115.1752296, 36.0872314],
//                         [-115.1752296, 36.0872882],
//                         [-115.1751603, 36.0872882],
//                         [-115.1751603, 36.0872314],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//         {
//             id: 'c7aa2db6-b93e-4a8e-beaf-1d25b0642e92',
//             type: 'Feature',
//             properties: {
//                 category: 'room',
//                 featureType: 'unit',
//                 pam: 'true',
//             },
//             geometry: {
//                 coordinates: [
//                     [
//                         [-115.1751603, 36.0873173],
//                         [-115.1752296, 36.0873173],
//                         [-115.1752296, 36.0873718],
//                         [-115.1751603, 36.0873718],
//                         [-115.1751603, 36.0873173],
//                     ],
//                 ],
//                 type: 'Polygon',
//             },
//         },
//     ],
// };

class Map extends React.PureComponent {
    componentDidUpdate(prevProps) {
        if (this.props.rotation !== prevProps.rotation) {
            this.map.setBearing(this.props.rotation);
        }
    }

    addDummyData() {
        this.point1 = makeFeature({
            type: 'Point',
            properties: {
                featureType: 'anchor',
            },
        });

        this.point1.geometry.coordinates = [-115.17358705767026, 36.08692486396957];

        this.draw.add(this.point1);

        this.point2 = makeFeature({
            type: 'Point',
            properties: {
                featureType: 'anchor',
            },
        });

        this.point2.geometry.coordinates = [-115.17873410176405, 36.088069169792846];

        this.draw.add(this.point2);
    }

    drawShortestPath = () => {
        this.draw.delete('shortest-path');

        const featureCollection = this.draw.getAll();

        featureCollection.features = featureCollection.features.filter(feature =>
            ['unit', 'kiosk'].includes(feature.properties.featureType)
        );

        const path = turf.shortestPath(
            this.point1.geometry.coordinates,
            this.point2.geometry.coordinates,
            {
                obstacles: turf.buffer(featureCollection, 0.003),
            }
        );

        const curvyPath = turf.bezierSpline(path, {sharpness: 0.1});
        curvyPath.id = 'shortest-path';
        this.draw.add(curvyPath);
    };

    componentDidMount() {
        this.map = new mapboxGl.Map({
            container: 'mapbox-snap-map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [-73.979582, 40.764116],
            zoom: 14.5,
            hash: true,
            pitchWithRotate: false,
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

        this.map.addControl(this.draw, 'bottom-left');

        window.map = this.map;

        this.map.on('load', () => {
            this.props.onMapReady({
                map: this.map,
                draw: this.draw,
                rotation: round(this.map.getBearing(), 1), // potentially set from the URL
            });

            this.addDummyData();
            this.drawShortestPath();

            this.map.on('draw.create', this.drawShortestPath);
            this.map.on('draw.delete', this.drawShortestPath);
            this.map.on('draw.update', this.drawShortestPath);
        });

        this.map.on('rotate', () => {
            const bearing = round(this.map.getBearing(), 1);

            if (bearing !== this.props.rotation) {
                this.props.onRotationChange(Math.round(bearing * 1000) / 1000);
            }
        });

        this.map.on('draw.selectionchange', ({features}) => {
            if (features.length !== 1) {
                this.props.setCurrentFeature(null);
            } else {
                this.props.setCurrentFeature(features[0].id);
            }
        });
    }

    render() {
        return (
            <div className={this.props.className}>
                <div id="mapbox-snap-map" style={{height: '100%'}} />

                {!!this.props.imageLayer && (
                    <ImageLayer {...this.props.imageLayer} map={this.map} />
                )}
            </div>
        );
    }
}

export default Map;
