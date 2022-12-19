import { View, Switch, Text, Button, TouchableOpacity, RefreshControl } from "react-native";
import styles from '../styles/styles';
import React, { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";

//fetch
import { LoadingIcon } from './LoadingIcon';
import moment from 'moment';
import { ScrollView, TextInput } from "react-native-gesture-handler";
//import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@Down_Key";
const STORAGE_KEY2 = "@Up_Key";

//notification
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

//Refresh control
const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoaded, setIsLoaded] = useState();
  const [hourPrice, setHourPrice] = useState([])
  const [priceLimitDown, setPriceLimitDown] = useState(20)
  const [priceLimitUp, setPriceLimitUp] = useState(80)
  const [hour, setHour] = useState();
  //Async
  const [getValue, setGetValue] = useState('');
  const [getUpValue, setGetUpValue] = useState('');
  //Refresh Control
  const [refreshing, setRefreshing] = React.useState(false);

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
        setHourPrice(res[0]['24h'])
      })
    setIsLoaded(true)
  }

  useEffect(() => {
    schedulePushNotification()
    fetchToday()
    let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
    setHour(curDate.substring(8, 10))
    getValueFunction()
    getUpValueFunction()
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
  }

  const saveValueFunction = () => {
    // Virheen tarkistus ettei alaraja ole isompi kuin yläraja ja toisinpäin
    if (priceLimitDown) {
      AsyncStorage.setItem(STORAGE_KEY, priceLimitDown);
      setPriceLimitDown('');
      setGetValue(priceLimitDown)
    } if (priceLimitUp) {
      AsyncStorage.setItem(STORAGE_KEY2, priceLimitUp);
      setPriceLimitUp('');
      setGetUpValue(priceLimitUp)
    }
    else {
      //alert('Syötä tiedot.');
    }
  };

  const getValueFunction = () => {
    AsyncStorage.getItem(STORAGE_KEY).then(
      (value) =>
        setGetValue(value)
    );
  };

  const getUpValueFunction = () => {
    AsyncStorage.getItem(STORAGE_KEY2).then(
      (value) =>
        setGetUpValue(value)
    );
  };

  // Käyttöehdot button
  const [showValue, setShowValue] = useState(false);
  const onPress = () => setShowValue(!showValue);

  //Check time
  let priceNow = ''
  for (let i = 0; i < hourPrice.length; i++)
    if (hour === hourPrice[i].time) {
      priceNow = ((100 + 10) / 100 * hourPrice[i].price).toFixed(2)
    }

  //Refresh Control
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
    schedulePushNotification()
    getValueFunction()
    getUpValueFunction()
  }, [priceLimitDown, priceLimitUp]);

  if (!isLoaded) {
    return (<LoadingIcon />)
  } else {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["yellow", "orange", "red", "blue", "pink"]}
              size="large"
              progressBackgroundColor={"black"}
            />
          }
        >
          <View style={{ marginLeft: 30 }}>
            <View>
              <Text style={[styles.text, { marginTop: 20, fontSize: 18, color: '#d4850e' }]}>Salli push ilmoitukset</Text>
              <Switch style={{ alignSelf: 'flex-start' }}
                trackColor={{ false: "#767577", true: "#a6d3d8" }}
                thumbColor={isEnabled ? "orange" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
            <View><Text style={styles.text}>Asettamasi hinta rajat: {getValue} snt/kWh - {getUpValue} snt/kWh</Text></View>
            <View>
              <View style={[{ marginBottom: -20, marginTop: 20 }]}>
                <TextInput
                  placeholder="Aseta alaraja"
                  maxLength={2}
                  keyboardType="numeric"
                  value={priceLimitDown}
                  onChangeText={(data) => setPriceLimitDown(data)}
                  underlineColorAndroid="transparent"
                  style={{ margin: 10, backgroundColor: 'orange', paddingLeft: 20, width: 150 }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 50 }}>
                <TouchableOpacity onPress={saveValueFunction} style={styles.buttonStyle}>
                  <Text style={[styles.text, { fontSize: 20, textAlign: 'center', color: 'orange' }]}> Tallenna </Text>
                </TouchableOpacity>
              </View>
              <View style={[{ marginBottom: 20 }]}>
                <TextInput
                  placeholder="Aseta yläraja"
                  maxLength={2}
                  value={priceLimitUp}
                  keyboardType="numeric"
                  clearButtonMode="always"
                  onChangeText={(data) => setPriceLimitUp(data)}
                  underlineColorAndroid="transparent"
                  style={{ margin: 10, backgroundColor: 'orange', paddingLeft: 20, width: 150 }}
                />
              </View>
            </View>
            <View>
              <Text style={[styles.text, { fontSize: 18, color: '#d4850e' }]}>Datan lähteet: </Text>
              <Text style={[styles.text, { fontSize: 18 }]}>Fingrid & ENTSO-E</Text>
              <Text style={[styles.text, { fontSize: 18, marginTop: 20, color: '#d4850e' }]}>Tietosuoja:</Text>
              <Text style={[styles.text, { fontSize: 18, marginBottom: 20 }]}>Sovellus ei kerää käyttäjästä mitään henkilökohtaista dataa, ainoa kerättävä data on käyttäjän syöttämät kodinkoneet ja niiden kwh arvot.</Text>
              <TouchableOpacity
                onPress={onPress}
                style={styles.button}
              >
                <Text style={[styles.text, { color: '#d4850e', fontSize: 18 }]}>
                  Käyttöehdot
                </Text>
              </TouchableOpacity>
              {showValue ? <Text style={[styles.text, { marginTop: 20, marginBottom: 30 }]}>Sovelluksen tekijät eivät vastaa hintatietojen oikeellisuudesta,
                sillä data saadaan kolmannelta osapuolelta. Jatkuvaa toimivuutta ei tämän takia voida sovellukselle taata.
                Käyttäjä vastaa itse syöttämistään arvoista ja niissä olevista virheistä ei sovelluksen kehittäjät vastaa. Laskukaavat antavat joka tapauksessa viitteellisen arvion.  </Text> : null}</View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
export { SettingsScreen };