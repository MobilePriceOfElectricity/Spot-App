import {View, Text, Dimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  BarChart,
} from "react-native-chart-kit";
import {
  responsiveWidth
} from "react-native-responsive-dimensions";
import styles from '../styles/styles';

const screenWidth = Dimensions.get("window").width;
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


export function InlandCfImport() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [PieData, setPieData] = useState([]);
  let asd = 0;

  const [data, setData] = useState({
    labels: ["Suomen tuotanto", "Tuonti"],
    datasets: [
      {
        data: PieData
      }
    ]
  })

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
      PieData.push(Math.round(res[0][0]['KokoSuomenTuotanto']['KokoVuodenData'] / res[2][0]['KeskiKulutus']['KokoVuodenData'] * 100)) 
      PieData.push(Math.round(100 - (res[0][0]['KokoSuomenTuotanto']['KokoVuodenData'] / res[2][0]['KeskiKulutus']['KokoVuodenData'] * 100)))

     })
     setIsLoaded(true)
    } 
    if(!isLoaded) {
      return ( <Text/> )
    } else {
  return ( <View >
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={[styles.text, {marginTop: 50}]}>
                  Tuotanto verrattuna ulkomaan tuontiin
          </Text>
        </View>
        <View style={{transform: [{rotate: '90deg'}]}}>
        <BarChart
          //showValuesOnTopOfBars={true}
          data={data}
          width={180}
          height={responsiveWidth(90)}
          fromZero={true}
          yAxisSuffix="%"
          //yLabelsOffset={25}
          xLabelsOffset={-26}
          segments={6}
          hideLegend={ true }
          //yAxisLabel="0"
          withInnerLines={false}
          //withVerticalLabels={false}
          
          style={{
            marginVertical: 8,
            borderRadius: 8,
            padding: 35,
            paddingRight: 40,
            paddingTop: 40,
            paddingLeft: -20
            

            
          }}
          
          chartConfig={{
            backgroundColor: "#1f2131",
            backgroundGradientFrom: "#1f2131",
            backgroundGradientTo: "#1f2131",
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 0) => `rgba(176, 72, 157, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(166, 211, 216, ${opacity})`,
            barPercentage: '0.8',
            propsForLabels: {
              strokeWidth: 10,
              
            }
            
          
            
            
          }}
          
          verticalLabelRotation={-90}
          horizontalLabelRotation={-90}
        />
    </View>
  </View>)
  }
}





/* import {View, Text } from "react-native";
import React, { useEffect, useState} from 'react';

  export default function App() {

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { 
    KeskiKulutus()
  },[]) 


  const api = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2ZTZhMjM4MC01YjkwLTAxM2ItOTg2Ny0wMzFhMzJiYjRkNTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjcwNzY5OTUxLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Im5pZ2hib3Qtc3RhdHMifQ.PubdgdyNbB2i6GZfpNQO8zflo050se4cNvpOGM2VxIE "
  const url = "https://api.pubg.com/shards/steam/samples?filter[createdAt-start]=2022-12-09T00%3A00%3A00Z";
  const  KeskiKulutus = async() => {    
    await fetch(url, { 
        method: 'post', 
        headers: {
            Accept : 'application/json',
            Authorization : 'Bearer ' + api,        
        }, 
        body: JSON.stringify({
            key: 'test',
        })
    })
   .then((resp) => resp.json())
   .then((res) => {  
    console.log(res)
   })
   .catch((err) => {
    console.log(err)
   })
  } 

  if(isLoaded === true) {
    return ( <View><Text>Loading...</Text></View>)
  } else {
    return (<View><Text>test</Text></View>
    )
  }
}
 */

/*  */



/* const api = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2ZTZhMjM4MC01YjkwLTAxM2ItOTg2Ny0wMzFhMzJiYjRkNTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjcwNzY5OTUxLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Im5pZ2hib3Qtc3RhdHMifQ.PubdgdyNbB2i6GZfpNQO8zflo050se4cNvpOGM2VxIE "

const  KeskiKulutus = async() => {    
  await fetch('https://api.pubg.com/shards/steam/samples?filter[createdAt-start]=2022-12-09T00%3A00%3A00Z', {
   method: 'POST',
   headers : {
      
     'Accept' : 'application/json',
     'Content-type' : 'application/json',
     'mode' : 'no-cors',
     "Authorization" : 'basic' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI2ZTZhMjM4MC01YjkwLTAxM2ItOTg2Ny0wMzFhMzJiYjRkNTMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjcwNzY5OTUxLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Im5pZ2hib3Qtc3RhdHMifQ.PubdgdyNbB2i6GZfpNQO8zflo050se4cNvpOGM2VxIE"
   }, body: JSON.stringify({
     key: 'test',
   })
 })
 .then((resp) => resp.json())
 .then((res) => {  
  console.log(res)
 })
 .catch((err) => {
  console.log(err)
 })
}  */

