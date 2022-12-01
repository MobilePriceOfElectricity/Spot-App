import {View} from "react-native";
import React, { useEffect, useState} from 'react';
import {
    PieChart,
  } from "react-native-chart-kit";
import {LoadingIcon} from "./LoadingIcon";

  export function ElectricityProduction() {

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { 
    fetchData()
  },[])

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
    {
      name: "% Teollisuuden",
      population: 0,
      color: "Black",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "% Muu",
      population: 0,
      color: "Grey",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    
  ]);

   const fetchData = () => {
    fetch('http://www.students.oamk.fi/~n0juro00/MobiiliProjekti/FingridData.php', {
      method: 'POST',
      headers : {
        'Accept' : 'application/json',
        'Content-type' : 'application/json',
        'mode' : 'no-cors' 
      }, body: JSON.stringify({
        key: 'test',
      })
    })
    .then((resp) => resp.json())
    .then((res) => {
      const ydinvoima = res[0][0]['Ydivoima']['KokoVuodenData'];
      const tuulivoima = res[0][0]['Tuulivoima']['KokoVuodenData'];
      const vesivoima = res[0][0]['Vesivoima']['KokoVuodenData'];
      const teollisuuden = res[0][0]['Teollisuuden']['KokoVuodenData'];
      const kokoSuomenTuotanto = res[0][0]['KokoSuomenTuotanto']['KokoVuodenData']  
      PieChartData[0]['population'] = Math.round(tuulivoima / kokoSuomenTuotanto * 100);
      PieChartData[1]['population'] = Math.round(vesivoima / kokoSuomenTuotanto * 100);
      PieChartData[2]['population'] = Math.round(ydinvoima / kokoSuomenTuotanto * 100);
      PieChartData[3]['population'] = Math.round(teollisuuden / kokoSuomenTuotanto * 100);
      PieChartData[4]['population'] = Math.round( 100 - (ydinvoima + teollisuuden + vesivoima + tuulivoima) / kokoSuomenTuotanto * 100) 
      setIsLoaded(true)
    })
   } 
  
  if(!isLoaded) {
    return ( <LoadingIcon/> )
  } else {
    return (
      <View>
        <PieChart
          data={PieChartData}
          width={500}
          height={200}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingHorizontal={"100"}
          paddingLeft={20}
          center={[1, 10]}
          absolute 
        />
      </View>
    )
  }
}

