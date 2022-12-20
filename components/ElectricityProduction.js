import {StyleSheet, View, Text} from "react-native";
import React, { useEffect, useState} from 'react';
import {
    PieChart,
  } from "react-native-chart-kit";
import {LoadingIcon} from "./LoadingIcon";
import styles from "../styles/styles";

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
      color: "#7DB67C",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
    {
      name: "% Vesivoima",
      population: 0,
      color: "#41859F",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
    {
      name: "% Ydinvoima",
      population: 0,
      color: "#173F6E",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
    {
      name: "% Teollisuus",
      population: 0,
      color: "#292B2E",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
    {
      name: "% Muu",
      population: 0,
      color: "#D3D3D3",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
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
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Text style={[styls.text, {marginTop: 15}]}>
            Suomen sähkön tuotanto
          </Text>
        </View>
      <View style={{backgroundColor:  `rgba(31, 33, 49, 1)`, marginBottom: -10, borderRadius: 8, marginHorizontal:8, marginTop: 15, }}>
          <PieChart
            data={PieChartData}
            width={300}
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
      </View>
    )
  }
}


const styls = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  fadingContainer: {
    alignSelf: 'center',
    width: "1%",
    marginTop: 350
  },
  text: {
    color: '#a6d3d8',
    fontFamily: "MontserratRegular"
  },  
  
});
