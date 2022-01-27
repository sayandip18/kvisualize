import React, {useState, useEffect, useMemo } from 'react';
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
    (async function(){
        let revenueData = {}; 
        let generalData = {}; 
        await axios.get("https://kyupid-api.vercel.app/api/users")
        .then(res=>{
            let allUsers = res.data.users;
            let proUsers = allUsers.filter(user => {
                return user.is_pro_user
            });

            //total info for General Map
            let totalUsers = allUsers.length;
            let totalMaleUsers = allUsers.filter(user => {
                return user.gender === 'M'
            }).length;
            let totalFemaleUsers = allUsers.filter(user => {
                return user.gender === 'F'
            }).length;
            let totalMatches = allUsers.filter(user => {
                return user.total_matches
            }).length;

            //total info for Revenue Map
            let totalProUsers = proUsers.length;
            let totalMaleProUsers = proUsers.filter(user => {
                return user.gender === 'M'
            }).length;
            let totalFemaleProUsers = proUsers.filter(user => {
                return user.gender === 'F'
            }).length;
            let totalProMatches = proUsers.filter(user => {
                return user.total_matches
            }).length;
            let totalRevPercentage = ((totalProUsers / totalUsers) * 100).toFixed(1);

            allUsers.forEach((user) => {
                if (!(user.area_id in generalData)) {
                    generalData[user.area_id] =
                    {
                        "totalUsers": 0,
                        "male": 0,
                        "female": 0,
                        "total_matches": 0
                    };
                }
                else {
                    generalData[user.area_id]["totalUsers"]++;

                    if (user.gender === 'M') generalData[user.area_id]["male"]++;
                    else generalData[user.area_id]["female"]++;

                    if (user.total_matches) generalData[user.area_id]["total_matches"]++;
                }
            });
            proUsers.forEach((user) => {
                if (!(user.area_id in revenueData)) {
                    revenueData[user.area_id] =
                    {
                        "totalUsers": 0,
                        "male": 0,
                        "female": 0,
                        "revPercentage": 0,
                        "total_matches": 0,
                    };
                }
                else {
                    revenueData[user.area_id]["totalUsers"] = revenueData[user.area_id]["totalUsers"] + 1;

                    if (user.gender === 'M') revenueData[user.area_id]["male"]++;
                    else revenueData[user.area_id]["female"]++;

                    revenueData[user.area_id]["revPercentage"] = ((revenueData[user.area_id]["totalUsers"] / proUsers.length) * 100).toFixed(2);

                    if (user.total_matches) revenueData[user.area_id]["total_matches"]++;
                }

            });
            revenueData[0] = {
                "totalUsers": totalProUsers,
                "male": totalMaleProUsers,
                "female": totalFemaleProUsers,
                "total_matches": totalProMatches,
                "totalRevPercentage": totalRevPercentage,
            }
            generalData[0] = {
                "totalUsers": totalUsers,
                "male": totalMaleUsers,
                "female": totalFemaleUsers,
                "total_matches": totalMatches
            }
            setRevenueData(revenueData);
            setGeneralData(generalData);
        })

        await fetch("https://kyupid-api.vercel.app/api/areas")
            .then((res) => res.json())
            .then((new_areas) => {
                new_areas["features"].forEach((area) => {
                area["properties"]["totalProUsers"] = revenueData[area.properties.area_id]["totalUsers"];
                area["properties"]["totalGeneralUsers"] = generalData[area.properties.area_id]["totalUsers"];

            })
                setAreas(new_areas)
            })
    })();
    
}, []);

  function getCursor({ isHovering, isDragging }) {
    return isDragging ? 'grabbing' : isHovering ? 'pointer' : 'default';
}
  const selectedArea = (regionalDash && regionalDash.area_id) || '';
  const filter = useMemo(() => ['in', 'area_id', selectedArea], [selectedArea]);

  const generalLayerStyle = {
    id: "area",
    type: "fill",
    paint: {
    // "fill-opacity": 0.7,
    "fill-outline-color": "rgb(52,51,50)", 
    'fill-color': {
        property: 'totalGeneralUsers',
        stops: [
            [90,"#00FFFF"],
            [120,"#BFEFFF"],
            [150,"#87CEEB"],
            [180,'#33A1C9'],
            [220,"#38B0DE"],
            [250,"#539DC2"],
            [280,"#0198E1"],
            [300,"#35586C"]
        ]
    }}
  };

  return (
    <div>
      <ReactMapGL {...viewport}
        onViewportChange={(newviewport) => setViewport(newviewport)}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        width="100vw"
        height="100vh"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        doubleClickZoom={false}
        getCursor={getCursor}
        onHover={
          (e) => {
            if (e?.features[0]?.properties?.area_id) 
            {
                let area_id = e.features[0].properties.area_id;
                setRegionalDash({
                    female: mapData[area_id].female,
                    male: mapData[area_id].male,
                    totalUsers: mapData[area_id].totalUsers,
                    totalMatches: mapData[area_id].total_matches,
                    type: "region",
                    areaName: e.features[0].properties.name,
                    revPercentage: mapData[area_id].revPercentage,
                    area_id: area_id,
                });
                togglePopup(true);
            }
            else {
                togglePopup(false);
            }
          }
        }
      >
         <Source type="geojson" data={areas}>
          <Layer {...generalLayerStyle} />
        </Source>
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