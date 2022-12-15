import { View, Switch, Text, Button } from "react-native";
import styles from '../styles/styles';
import React, { useState, useEffect } from "react";
//import Slider from '@react-native-community/slider';
//import * as TaskManager from 'expo-task-manager';
import * as Notifications from "expo-notifications";
import MultiSlider from '@ptomasroos/react-native-multi-slider'

//Liittyy fetchiin
import { LoadingIcon } from './LoadingIcon';
import moment from 'moment';



// notification
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState();
  const [hourPrice, setHourPrice] = useState([])
  const [priceLimitDown, setPriceLimitDown] = useState(20)
  const [priceLimitUp, setPriceLimitUp] = useState(80)
  const [hour, setHour] = useState();

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const fetchToday = () => {
    fetch('http://www.students.oamk.fi/~n0juro00/MobiiliProjekti/GetEstoeeData.php', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'mode': 'no-cors'
      }, body: JSON.stringify({
        key: 'test',
      })
    })
      .then((resp) => resp.json())
      .then((res) => {
        //console.log(res[0]['24h'])
        setHourPrice(res[0]['24h'])
      })
    setIsLoaded(true)
  }

  useEffect(() => {

    
    schedulePushNotification()
    fetchToday()
    //liittyy fetchiin
    let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
    setHour(curDate.substring(8, 10))
  }, []);


  async function schedulePushNotification() {

    const hasPushNotificationPermissionGranted = await allowsNotificationsAsync()
    // Price limits
    if (hasPushNotificationPermissionGranted && priceLimitUp < priceNow && isEnabled === true) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hinta tieto",
          body: 'Pörssisähkön hinta on nyt kallista.',
          data: { data: 'goes here' },
        },
        trigger: { seconds: 2 },
      });
    }
    if (hasPushNotificationPermissionGranted && priceLimitDown > priceNow && isEnabled === true) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hinta tieto",
          body: 'Pörssisähkön hinta on nyt halpaa.',
          data: { data: 'goes here' },
        },
        trigger: { seconds: 2 },
      });
    }

    /*
    //Charger price limit
    if (hasPushNotificationPermissionGranted && 100000 < priceNow) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lataus",
          body: 'Sähkön hinta on nyt kallista. Jos mahdollista, siirrä latausta myöhemmäksi.',
          data: { data: 'goes here' },
        },
        trigger: { seconds: 2 },
      });
    }

    */
  }

  // const sendPrice = () => {
  //   return(
  //     <PriceListScreen joku={priceLimitDown} />
  //   )
  // }
<Button title= {'click'} onPress={() => {navigation.navigate('Tuntihinnat', {alajuttu : priceLimitDown, ylajuttu: priceLimitUp})}}/>

  //Tarkista kello
  let priceNow = ''
  for (let i = 0; i < hourPrice.length; i++)
    if (hour === hourPrice[i].time) {
      priceNow = ((100 + 10) / 100 * hourPrice[i].price).toFixed(2)
    }

    console.log(priceNow)

  if (!isLoaded) {
    return (<LoadingIcon />)
  } else {
    return (
      <View style={styles.container}>
        

       
        <View style={{ marginLeft: 30 }}>
          <View>
            <Text style={styles.text}>Salli push ilmoitukset</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#a6d3d8" }}
              thumbColor={isEnabled ? "orange" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <View><Text style={styles.text}>Asettamasi hinta rajat: {priceLimitDown} snt/kWh - {priceLimitUp} snt/kWh</Text></View>
          <View style={[{ marginBottom: 20, marginTop: 20 }]}>
            <MultiSlider
              min={1}
              max={50}
              allowOverlap
              values={[20]}
              //sliderLength={width}
              onValuesChange={(val) => (setPriceLimitDown(val))}
              enableLabel={false}

              //customLabel={SliderCustomLabel(textTransformerTimes)}
              trackStyle={{
                height: 8,
                borderRadius: 8,
              }}
              markerOffsetY={3}
              markerSize={10}
              selectedStyle={{
                backgroundColor: "orange",
              }}
              unselectedStyle={{
                backgroundColor: "#a6d3d8",
              }}
            />   
          </View>
          <View style={[{ marginBottom: 20, marginTop: 20 }]}>
            <MultiSlider
              min={50}
              max={100}
              allowOverlap
              values={[80]}
              //sliderLength={width}
              onValuesChangeFinish={(val) => (setPriceLimitUp(val))}
              enableLabel={false}

              //customLabel={SliderCustomLabel(textTransformerTimes)}
              trackStyle={{
                height: 8,
                borderRadius: 8,
              }}
              markerOffsetY={3}
              markerSize={8}
              selectedStyle={{
                backgroundColor: "#a6d3d8",
              }}
              unselectedStyle={{
                backgroundColor: "orange",
              }}
            />
          </View>
          <View>
            <Text style={styles.text}>Tietoja</Text>
            <Text style={styles.text}>Datan lähteet: </Text>
            <Text style={styles.text}>Fingrid & ENTSO-E:</Text>
            <Text style={styles.text}>Tietosuoja:</Text>
            <Text style={styles.text}>Sovellus ei kerää käyttäjästä mitään henkilökohtaista dataa, ainoa kerättävä data on käyttäjän syöttämät kodinkoneet ja niiden kwh arvot.</Text>
            <Text style={styles.text}>Käyttöehdot:</Text>
            <Text style={styles.text}>Sovelluksen tekijät eivät vastaa hintatietojen oikeellisuudesta,
              sillä data saadaan kolmannelta osapuolelta. Jatkuvaa toimivuutta ei tämän takia voida sovellukselle taata.
              Käyttäjä vastaa itse syöttämistään arvoista ja niissä olevista virheistä ei sovelluksen kehittäjät vastaa. Laskukaavat antavat joka tapauksessa viitteellisen arvion.  </Text></View>
        </View>
      </View>
    );
  }
}
export { SettingsScreen };