import React, {useState, useEffect} from 'react';
import './App.css';
import ReactMapGL, { NavigationControl} from 'react-map-gl';
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

  const [revenue, setRevenue] =  useState();
  const [general, setGeneral] = useState();
  const [areas, setAreas] = useState();

  useEffect( () => {
    const fetchAllData = async () => {
      const res = await axios.get('https://kyupid-api.vercel.app/api/users');
      const allUsers = res.data.users;
      const totalUsers = allUsers.length;
      const totalMale = allUsers.filter(user => user.gender === 'M').length;
      const totalFemale = allUsers.filter(user => user.gender === 'F').length;
      const totalMatches = allUsers.filter(user => user.total_matches).length;
      
      const proUsers = allUsers.filter(user => user.is_pro_user);
      const totalPro = proUsers.length;
      const totalMalePro = proUsers.filter(user => user.gender === 'M').length;
      const totalFemalePro = proUsers.filter(user => user.gender === 'F').length;
      const totalProMatches = proUsers.filter(user => user.total_matches).length;
      const totalRevPercentage = ((totalPro / totalUsers) * 100).toFixed(1);

      allUsers.forEach(user => {
        if(!(user.area_id in general)){
            general[user.area_id] = {
              "totalUsers": 0,
              "male": 0,
              "female": 0,
              "total_matches": 0
            };
        }
        else {
          general[user.area_id]["totalUsers"]++;
          if (user.gender === 'M') general[user.area_id]["male"]++;
          else general[user.area_id]["female"]++;

          if (user.total_matches) general[user.area_id]["total_matches"]++;
        }
      });

      proUsers.forEach(
        user => {
            if (!(user.area_id in revenue)) {
              revenue[user.area_id] =
              {
                  "totalUsers": 0,
                  "male": 0,
                  "female": 0,
                  "revPercentage": 0,
                  "total_matches": 0,
              };
          }
          else {
              revenue[user.area_id]["totalUsers"] = revenue[user.area_id]["totalUsers"] + 1;

              if (user.gender === 'M') revenue[user.area_id]["male"]++;
              else revenue[user.area_id]["female"]++;

              revenue[user.area_id]["revPercentage"] = ((revenue[user.area_id]["totalUsers"] / proUsers.length) * 100).toFixed(2);

              if (user.total_matches) revenue[user.area_id]["total_matches"]++;
          }
        }
      );

      general[0] = {
        "totalUsers": totalUsers,
        "male": totalMale,
        "female": totalFemale,
        "total_matches": totalMatches
      };

      revenue[0] = {
        "totalUsers": totalPro,
        "male": totalMalePro,
        "female": totalFemalePro,
        "total_matches": totalProMatches,
        "totalRevPercentage": totalRevPercentage,
      };

      setRevenue(revenue);
      setGeneral(general);


      const new_area = axios.get('https://kyupid-api.vercel.app/api/areas');
      new_area["features"].forEach(
        area => {
          area["properties"]["totalProUsers"] = revenue[area.properties.area_id]["totalUsers"];
          area["properties"]["totalGeneralUsers"] = general[area.properties.area_id]["totalUsers"];
        }
      );
      setAreas(new_area);

    }

    fetchAllData();
  },[]);

  return (
    <div>
      <ReactMapGL {...viewport}
        onViewportChange={setViewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
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