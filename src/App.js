import React, {useState, useEffect } from 'react';
import './App.css';
import ReactMapGL, { NavigationControl, Source, Layer } from 'react-map-gl';
import axios from 'axios';
import Panel from './Panel';

function App() {
  const [viewport, setViewport] = useState({
    latitude: 12.9716,
    longitude:77.5946,
    zoom: 9,
    bearing: 0,
    pitch: 50
  });

  const [revenueData, setRevenueData] =  useState();
  const [generalData, setGeneralData] = useState();
  const [areas, setAreas] = useState();
  const [regionalDash, setRegionalDash] = useState(null);
  

  useEffect(() => {
    
}, []);

  return (
    <div>
      <ReactMapGL {...viewport}
        onViewportChange={(newviewport) => setViewport(newviewport)}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        doubleClickZoom={false}
      >
         
        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>
      </ReactMapGL>
      <Panel />
    </div>
  );
};

const navStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '10px'
};

export default App;