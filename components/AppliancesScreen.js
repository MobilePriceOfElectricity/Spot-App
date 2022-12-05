import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useState,useEffect } from 'react'
import {AntDesign} from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Col, Row, Grid  } from "react-native-easy-grid"
const STORAGE_KEY = "@appliance_Key";
const STORAGE_KEY2 = "@kwh_Key";



export default function AppliancesScreen({route,navigation}) {  
    const [appliances,setAppliances] = useState([]);
    const [kwhs,setKwhs] = useState([]);

  
const storeData = async (value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(STORAGE_KEY,jsonValue);
    } catch (e) {
        console.log(e);
    }
}
    const getData = async() => {
        try {
            return AsyncStorage.getItem(STORAGE_KEY)
            .then (req=> JSON.parse(req))
            .then(json => {
                if(json === null) {
                    json = [];
                }
                setAppliances(json);
            })
            .catch (error => console.log(error));
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(()=> {
         //AsyncStorage.clear(); 
        if (route.params?.appliance) {
            const newKey = appliances.length + 1;
            const newAppliance = {key: newKey.toString(),description: route.params.appliance};
            const newAppliances = [...appliances, newAppliance];
            storeData(newAppliances)
        }
        getData()
    },[route.params?.appliance])


    const storeData2 = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(STORAGE_KEY2,jsonValue);
        } catch (e) {
            console.log(e);
        }
    }
        const getData2 = async() => {
            try {
                return AsyncStorage.getItem(STORAGE_KEY2)
                .then (req=> JSON.parse(req))
                .then(json => {
                    if(json === null) {
                        json = [];
                    }
                    setKwhs(json);
                })
                .catch (error => console.log(error));
            } catch (e) {
                console.log(e);
            }
        }
    useEffect(()=> {
         //AsyncStorage.clear(); 
        if (route.params?.kwh) {
            const newKey = kwhs.length + 1;
            const newKwh = {key: newKey.toString(),description: route.params.kwh};
            const newKwhs = [...kwhs, newKwh];
            storeData2(newKwhs)
        }
        getData2()
    },[route.params?.kwh])



  useEffect(() => {
    navigation.setOptions({
        headerStyle: {
            backgroundColor: "#f0f0f0"
        },
        headerRight: () => (
            <AntDesign
            style={styles.navButton}
            name="plus"
            size={24}
            color="black"
            onPress={()=> navigation.navigate("Add")}
            />
        ),
    })
}, []) 

return (
<View style={styles.container}>

        <Grid>
        <Col>{
            appliances.map((appliance) => (
                <View key={appliance.key}>
                    <Text>{appliance.description}</Text>
                </View>
            ))
        }</Col>
        
       
        <Col>{
            kwhs.map((kwh) => (
                <View key={kwh.key}>
                    <Pressable onPress={()=> navigation.navigate("Add")}><Text>{kwh.description}</Text></Pressable>
                </View>
            ))
        }</Col>
    
    </Grid>
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
    flexDirection: "row",
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
});
