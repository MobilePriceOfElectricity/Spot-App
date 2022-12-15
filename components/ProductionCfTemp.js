import { StyleSheet, View, Dimensions, Button, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  LineChart,
} from "react-native-chart-kit";
import {LoadingIcon} from './LoadingIcon';
import { responsiveWidth } from "react-native-responsive-dimensions";
import { Entypo } from '@expo/vector-icons';



export function ProductionCfTemp() {

 const [KeskilampotilaArray, setKeskilampotila] = useState([])
 const [KeskiKulutusArray, setKeskiKulutus] = useState([])
 const [isLoaded, setIsLoaded] = useState();

   let Year = [
    "tammi", 
    "helmi",
    "maalis",
    "huhti",
    "touko",
    "kesä",
    "heinä",
    "elo",
    "syys",
    "loka",
    "marras",
    "joulu"  
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
        <View style={{  marginTop: 10}}>
          <View style={[styles.buttonContainer, {marginBottom: 10}]}>
            <Button title="Kuluva vuosi" color="#16171D"  onPress={() => setTimeFrame(Year)}></Button>
          </View>
        <View style={[styles.buttonContainer, {marginBottom: 10}]}>
          <Button title="Viimeiset kuusi kuukautta" color="#16171D" onPress={() => setTimeFrame(halfYear)}></Button>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <Text style={[styles.text, {marginTop: 15}]}>
            Kulutus verrattuna lämpötilaan
          </Text>
        </View>
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

            width={responsiveWidth(90)}
            height={220}
            //yAxisLabel=""
            //yAxisSuffix="GW/h / C"
            yAxisInterval={1}
            verticalLabelRotation={-30}
            //withDots={false}
            withShadow={true}
            segments={4}
            yLabelsOffset='50'
            //withHorizontalLabels={true}
            
            
            
            chartConfig={{
              backgroundColor: "#1f2131",
              backgroundGradientFrom: "#1f2131",
              backgroundGradientTo: "#1f2131",
              decimalPlaces: 0,
              
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              
              propsForDots: {
                r: "4",
                strokeWidth: "1.5",
                stroke: "#1f2131"
              },
              propsForLabels: {
                fontSize: 10,
                
            },
            }}
            bezier
            style={{
              marginTop: 0,
              paddingHorizontal: 0,
              marginVertical: 8,
              borderRadius: 8,
              marginTop: 10,
              paddingRight: 10,
              paddingLeft: 10
            }}
          />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Entypo name="dot-single" size={24} color="#d4850e" />
            <Text style={styles.text}>Celcius</Text>
            <Entypo name="dot-single" size={24} color="white" />
            <Text style={styles.text}>GW/h</Text>
          </View>  
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
      text: {
        color: '#a6d3d8',
        fontFamily: "MontserratRegular"
      },  
      
    });
    
