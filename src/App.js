import React, {useState} from 'react';
import './App.css';
import ReactMapGL from 'react-map-gl';

function App() {
  const [viewport, setViewport] = useState({
    latitude: 12.9716,
    longitude:77.5946,
    zoom: 9
  })

  return (
    <div>
      <ReactMapGL {...viewport}
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        width="100vw"
        height="50vh"
      />
      <div>Dashboard</div>
    </div>
  );
}

export default App;