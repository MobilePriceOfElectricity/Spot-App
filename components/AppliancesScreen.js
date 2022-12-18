import React, {useEffect, useState} from "react";


import Header from "./Header";
import ListItems from "./ListItems";
import InputModal from "./InputModal";
//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
const Home = ({appliances, setAppliances}) => {

  useEffect(()=> {
    //calculate();
  })

    //Poista kaikki kodinkoneet
    const handleClearAppliances = () =>{
        AsyncStorage.setItem("storedAppliances",JSON.stringify([])).then(() => {
            setAppliances([]);
        }).catch(error =>
            console.log(error))
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
        <Header handleClearAppliances={handleClearAppliances} />
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