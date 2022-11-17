import { Dimensions, View, Text } from "react-native";
import React, { useEffect, useState} from 'react';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from "react-native-chart-kit";

  export default function App() {

  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const [alldata, setAllData] = useState([])

  let combinedData = 0
  let singledata = 0 

  const [PieChartData, setPieChartData] = useState([
    {
      name: "% Tuulivoima",
      population: 0,
      color: "green",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "% Vesivoima",
      population: 0,
      color: "red",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "% Ydinvoima",
      population: 0,
      color: "blue",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
  ]);

  
  function GetWind(){
    return fetch(`https://api.fingrid.fi/v1/variable/181/events/json?start_time=2022-1-1T18%3A32%3A00Z&end_time=2022-6-28T18%3A35%3A00Z`, {
      headers: {
        'method' : 'GET', 
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'X-API-KEY' : 'QPZ8F4mEaW2GHtxuFbkle5qtTVkET5DQ4jabOACk' ,
        'mode' : 'cors',
      }
    }).then((response) => response.json())
  };
  
  function GetWater(){
    return fetch(`https://api.fingrid.fi/v1/variable/191/events/json?start_time=2022-1-1T18%3A32%3A00Z&end_time=2022-6-28T18%3A35%3A00Z`, {
      headers: {
        'method' : 'GET', 
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'X-API-KEY' : 'QPZ8F4mEaW2GHtxuFbkle5qtTVkET5DQ4jabOACk' ,
        'mode' : 'cors',
      }
    }).then((response) => response.json())
  };

  function GetNuclear(){
    return fetch(`https://api.fingrid.fi/v1/variable/188/events/json?start_time=2022-1-1T18%3A32%3A00Z&end_time=2022-6-28T18%3A35%3A00Z`, {
      headers: {
        'method' : 'GET', 
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'X-API-KEY' : 'QPZ8F4mEaW2GHtxuFbkle5qtTVkET5DQ4jabOACk' ,
        'mode' : 'cors',
      }
    }).then((response) => response.json())
  };

  function getAllData(){
    return Promise.all([GetWind(), GetWater(), GetNuclear()])
  }

  useEffect(() => { 
    getAllData()
    .then(([wind, water, nuclear]) => {
      let respdata = [wind, water, nuclear]
    
      for( let i = 0; i < respdata.length; i++) {
        singledata = 0  
        for (let x = 0; x < respdata[i].length; x++){
        combinedData += respdata[i][x]['value']  
        singledata += respdata[i][x]['value']
        } 
        alldata.push(singledata)
      }
      //console.log(alldata)
      for(let z = 0; z < 3; z++){
        PieChartData[z]['population'] = Math.round(alldata[z] / combinedData * 100) 
      } setIsLoaded(true)
    }) 
  },[]) 


  if(!isLoaded) {
    return ( <View><Text>Loading...</Text></View>)
  } else {
    return (
    <PieChart
      data={PieChartData}
      width={screenWidth}
      height={200}
      chartConfig={chartConfig}
      accessor={"population"}
      backgroundColor={"transparent"}
      paddingLeft={"0"}
      center={[1, 10]}
      absolute 
    />
    )
  }
}



