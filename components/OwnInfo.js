import React, {useEffect, useState} from 'react';
import Home from './AppliancesScreen'
import {Container} from "../styles/appStyles"

//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OwnInfo() {
    
  const initialAppliances = []

  const [appliances,setAppliances] = useState(initialAppliances);

  const loadAppliances = () => {
    AsyncStorage.getItem("storedAppliances").then(data => {
      if(data !== null) {
        setAppliances(JSON.parse(data))
      }
      
    }).catch((error) => console.log("error"));
  }

  useEffect(() => {
    loadAppliances();
  })

  return (
    <Container>
      <Home appliances={appliances} setAppliances={setAppliances}/>
    </Container>
  );
}
export {OwnInfo}
