import { View, Switch, Text } from "react-native";
import styles from '../styles/styles';
import React, { useState } from "react";
import Slider from '@react-native-community/slider';
import { ElCarScreen } from "./ElCarScreen";

const SettingsScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View style={styles.container}>
      <View>
        <ElCarScreen notifications={isEnabled} />
        <Text style={styles.text}>Salli push ilmoitukset</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      <View><Text style={styles.text}>Hintaraja</Text><Slider
        style={{ width: 200, height: 40, }}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#FFFFFF"
      /></View>
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

  );
}
export { SettingsScreen };