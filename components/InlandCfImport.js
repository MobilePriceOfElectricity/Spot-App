import {View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {
  PieChart,
} from "react-native-chart-kit";
import {LoadingIcon} from './LoadingIcon';

export function InlandCfImport() {

 const [isLoaded, setIsLoaded] = useState();
 const [PieData, setPieData] = useState([])

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

  const [data, setData] = useState([
    {
      name: "% Suomen tuontanto",
      population: 0,
      color: "rgba(131, 167, 234, 1)",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
    {
      name: "% Ulkomailta tuotava määrä",
      population: 0,
      color: "#F00",
      legendFontColor: "#7F7F7F",
      legendFontSize: 10
    },
  ]);

  useEffect(() => { 
   KeskiKulutus()
  },[])

  
   const  KeskiKulutus = async() => {    
     await fetch('http://www.students.oamk.fi/~n0juro00/MobiiliProjekti/FingridData.php', {
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
      PieData.push(Math.round(100 - (res[0][0]['KokoSuomenTuotanto']['KokoVuodenData'] / res[2][0]['KeskiKulutus']['KokoVuodenData'] * 100))) 
      PieData.push(Math.round(res[0][0]['KokoSuomenTuotanto']['KokoVuodenData'] / res[2][0]['KeskiKulutus']['KokoVuodenData'] * 100)) 
    })
    data[0]['population'] = PieData[1]
    data[1]['population'] = PieData[0]
    setIsLoaded(true)
   } 

   if(!isLoaded) {
    return ( <LoadingIcon/> )
  } else {
  return (
        <View>
          <PieChart
            data={data}
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
      );
    }
  }
