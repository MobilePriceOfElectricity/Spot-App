import React, {useEffect, useState} from "react";


import Header from "./Header";
import ListItems from "./ListItems";
import InputModal from "./InputModal";
import { Alert } from "react-native";
//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
const Home = ({appliances, setAppliances}) => {

  useEffect(()=> {
    //calculate();
  })
const info = () => {
    Alert.alert(
        //Otsikko
          'Kuinka lisätä, muokata ja poistaa kodinkone',
          //Alert teksti

          'Lisää kodinkone painamalla alahaalla olevaa plus painiketta. Muokkaa kodinkonetta napauttamalla kodinkoneen nimeä. Poista yksittäinen kodinkone pyyhkäisemällä vasemmalle poistettavan kodinkoneen kohdalla',
          [
            {
                text: '',
                onPress: () => console.log('No Pressed'),
                style: 'cancel',
              },
            ,
            {
              text: 'Ei',
              onPress: () => console.log('No Pressed'),
              style: 'cancel',
            },
          ],
          { cancelable: false }
          //clicking out side of alert will not cancel
            );
        }

    //Poista kaikki kodinkoneet
    const handleClearAppliances = () =>{
        //Tarkistetaan, haluaako käyttäjä varmasti tyhjentää koko listan
        Alert.alert(
    //Otsikko
      'Tyhjennä koko lista',
      //Alert teksti
      'Oletko varma, että haluat poistaa kaikki tallentamasi kodinkoneet ja niiden tiedot, jos vastaat kyllä, et voi perua toimintaasi',
      [
        { text: 'Kyllä', onPress: () =>  
        AsyncStorage.setItem("storedAppliances",JSON.stringify([])).then(() => {
            setAppliances([]);
        }).catch(error =>
            console.log(error))
            
        } 
        ,
        {
          text: 'Ei',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: false }
      //clicking out side of alert will not cancel
        );
    }
       

    //Modal näyttäminen
    const [modalVisible, setModalVisible] = useState(false);
    const [applianceInputValue,setApplianceInputValue] = useState();
    const [kwhValue,setKwhValue] = useState();
    //function to add new appliance
    const handleAddAppliance = (appliance) => {
        const newAppliances = [...appliances, appliance];
   

        AsyncStorage.setItem("storedAppliances",JSON.stringify(newAppliances)).then(() => {
            setAppliances(newAppliances);
            setModalVisible(false);
        }).catch(error =>
            console.log(error))
        }
    
    //Edit
    const [applianceToBeEdited,setApplianceToBeEdited] = useState(null);

    const handleTriggerEdit = (item) => {
        setApplianceToBeEdited(item);
        setModalVisible(true);
        setApplianceInputValue(item.title);
        setKwhValue(item.kwh);
    }
    const handleEditAppliance = (editedAppliance) => {
        const newAppliances = [...appliances];
        const applianceIndex = appliances.findIndex((appliance) => appliance.key === editedAppliance.key);
        newAppliances.splice(applianceIndex,1,editedAppliance);

        AsyncStorage.setItem("storedAppliances",JSON.stringify(newAppliances)).then(() => {
            setAppliances(newAppliances);
            setModalVisible(false);
            setApplianceToBeEdited(null)
        }).catch(error =>
            console.log(error))
    }
 
    return(
        <>
        <Header handleClearAppliances={handleClearAppliances} info={info} />
        <ListItems 
            appliances={appliances}
            setAppliances={setAppliances}
            handleTriggerEdit={handleTriggerEdit}
        />
        <InputModal 
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            applianceInputValue={applianceInputValue}
            setApplianceInputValue={setApplianceInputValue}
            kwhValue={kwhValue}
            setKwhValue={setKwhValue}
            applianceToBeEdited={applianceToBeEdited}
            setApplianceToBeEdited={setApplianceToBeEdited}
            handleAddAppliance={handleAddAppliance}
            handleEditAppliance={handleEditAppliance}
            appliances={appliances}
            />
        </>
    );
}
export default Home;