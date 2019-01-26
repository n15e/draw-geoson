import React, { Component } from 'react';
import Map from './Map/Map';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Draw GeoJson
        </header>
        <Map/>
      </div>
    );
  }
}

export default App;
