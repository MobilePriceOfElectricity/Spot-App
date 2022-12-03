import { StyleSheet, View, Dimensions, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  LineChart,
} from "react-native-chart-kit";
import {LoadingIcon} from './LoadingIcon';


export function ProductionCfTemp() {

 const [KeskilampotilaArray, setKeskilampotila] = useState([])
 const [KeskiKulutusArray, setKeskiKulutus] = useState([])
 const [isLoaded, setIsLoaded] = useState();

   let Year = [
    "tammikuu", 
    "helmikuu",
    "maaliskuu",
    "huhtikuu",
    "toukokuu",
    "kesäkuu",
    "heinäkuu",
    "elokuu",
    "syyskuu",
    "lokakuu",
    "marraskuu",
    "joulukuu"  
  ]

  const d = new Date();
  let month = d.getMonth();
  let currentYear = Year.slice(0, month + 1)
  const [halfYear, setHalfYear] = useState([]);
  const [timeFrame, setTimeFrame] = useState(currentYear)

  useEffect(() => { 
   GetData()
   GetHalfYear()
  },[])

  const GetHalfYear = () => {
    if (month > 6) {
      setHalfYear(Year.slice(0,6))
    } else {
      setHalfYear(Year.slice(0,month))
    }
  }

   const GetData = () => {
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
      for(let i = 0; i < Year.length; i++) {
        KeskiKulutusArray.push(res[2][0]['KeskiKulutus'][i])
      } 
      for(let i = 0; i < Year.length; i++) {
        KeskilampotilaArray.push(res[1][0]['Keskilampotila'][i])
      }
       setIsLoaded(true)
    })
   } 

   if(!isLoaded) {
    return ( <LoadingIcon/>)
  } else {
  return (
        <View>
          <Button title="Kuluva vuosi" onPress={() => setTimeFrame(Year)}></Button>
          <Button title="Viimeiset kuusi kuukautta" onPress={() => setTimeFrame(halfYear)}></Button>
          <LineChart
            data={{
              labels: timeFrame,
              datasets: [
                {
                  data :  KeskilampotilaArray.slice(0, timeFrame.length).map(item => {
                    return(item)
                })
                }, 
                {
                  data :  KeskiKulutusArray.slice(0, timeFrame.length).map(item => {
                    return(item / 1000)
                }), color: () => '#ED7C33' 
                } 
              ]
            }}

            width={Dimensions.get("window").width}
            height={220}
            yAxisLabel=""
            yAxisSuffix="GW/h / C"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726"
              }
            }}
            bezier
            style={{
              marginTop: 0,
              paddingHorizontal: 1,
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
      );
    }
  }
    
    const styles = StyleSheet.create({
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
    });
    
