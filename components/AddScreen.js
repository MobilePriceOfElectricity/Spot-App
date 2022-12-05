import { View, StyleSheet,Alert } from 'react-native'
import React, { useState,useEffect } from 'react'
import {AntDesign} from "@expo/vector-icons";
import { TextInput } from 'react-native';

export default function AddScreen({navigation}) {

    const [appliance,setAppliance] = useState("");
    const [kwh,setKwh] = useState("0");

    const checkTextInput = () => {

      if (!appliance.trim()) {
        Alert.alert('Please Enter Appliance');
      }

      if (!kwh.trim()) {
        Alert.alert('Please Enter Kwh');
      }

      alert('Success');
    };
   
    useEffect(() => {
      navigation.setOptions({
          headerStyle:{
              backgroundColor: "#f0f0f0"
          },
          headerRight: () =>(
              <AntDesign
              style={styles.navButton}
              name="save"
              size={24}
              color="black"
              onPress={()=> navigation.navigate("Home", {kwh:kwh, appliance:appliance})}
              />
          ),
      })
  },[kwh,appliance])
  

  return (
    <View>
      <TextInput
      style={styles.newTask} 
      onChangeText={value => setAppliance(value)}
      value={appliance}
      placeholder="Kodinkone"
      />
      <TextInput
      style={styles.newTask} 
      onChangeText={value => setKwh(value)}
      value={kwh}
      keyboardType='numeric'
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContainer:{
      flex: 1,
      flexDirection:"row",
      marginTop: 5,
      marginBottom: 5,
  },
  rowText: {
      fontSize: 20,
      marginLeft: 5,
  },
  navButton: {
      marginRight:5,
      fontSize: 24,
      padding:4,
  },
  newTask: {
    width: "100%",
    margin:20,
    fontSize: 18
  }
});