import React, {useState, useEffect} from "react";
import { Alert, Modal } from "react-native";
import {
    ModalButton,
    ModalContainer,
    ModalView,
    StyledInput,
    ModalAction,
    ModalActionGroup,
    HeaderTitle,
    colors
} from "../styles/appStyles"
import {AntDesign} from "@expo/vector-icons"
import moment from 'moment';
const InputModal = ({modalVisible,
    setModalVisible,
    applianceInputValue,
    kwhValue, 
    setApplianceInputValue,
    setKwhValue,  
    handleAddAppliance,
    applianceToBeEdited,
    setApplianceToBeEdited,
    handleEditAppliance,
appliances}) => {
    const [hourPrice, setHourPrice] = useState([])
    //liittyy fetchiin
    const [hour, setHour] = useState();

//Fetch price
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
}
useEffect(() => {
    fetchToday()

    //liittyy fetchiin
    let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
    setHour(curDate.substring(8, 10))
}, [])

//Check time
let priceNow = ''
for (let i = 0; i < hourPrice.length; i++)
    if (hour === hourPrice[i].time) {
        priceNow = ((100 + 10) / 100 * hourPrice[i].price).toFixed(2)
    }
    const handleCloseModal = () => {
        setModalVisible(false);
        setApplianceInputValue("");
        setKwhValue("");
        setApplianceToBeEdited(null)
    }
    const handleSubmit = () => {
        if(!applianceToBeEdited){
            //Tarkistetaan, ettei kentät ole tyhjiä
            if(applianceInputValue === "" || kwhValue === ""){
                return Alert.alert(
                    //Otsikko
                      'HUOM!',
                      'Jokin arvo jäi täyttämättä',
                      [
                        {
                            text: '',
                            onPress: () => console.log('No Pressed'),
                            style: 'cancel',
                          },
                        ,
                        {
                          text: 'Sulje',
                          onPress: () => console.log('No Pressed'),
                          style: 'cancel',
                        },
                      ],
                      { cancelable: false }
                      //clicking out side of alert will not cancel
                        );
                    }else {
        handleAddAppliance({
            title: applianceInputValue,
            kwh: kwhValue,
            summa: (priceNow * kwhValue / 100).toFixed(2),
            key:`${(appliances[appliances.length-1] && parseInt(appliances[appliances.length-1].key)+1) || 1}`
        })}}
     else {
        handleEditAppliance({
            title: applianceInputValue,
            kwh: kwhValue,
            summa: (priceNow * kwhValue / 100).toFixed(2),
            key: applianceToBeEdited.key
        })
    }
        setApplianceInputValue("");
        setKwhValue("");
    } 
    return (
        <>
            <ModalButton onPress={()=>{setModalVisible(true)}}>
                <AntDesign name="plus" size={30} color={colors.secondary}/>
            </ModalButton>
            <Modal 
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <ModalContainer>
                    
                    <ModalView>

                        <HeaderTitle>Lisää kodinkone</HeaderTitle>

                    <StyledInput 
                        placeholder="Kodinkone"
                        placeholderTextColor ={colors.alternative}
                        selectionColor = {colors.secondary}
                        autoFocus={true}
                        onChangeText={(text) => setApplianceInputValue(text)}
                        value={applianceInputValue}
                        onSubmitEditing ={handleSubmit}
                        
                    />
                    <StyledInput 
                        placeholder="Ilmoita kodinkoneen kuluttama kwh/tunti"
                        placeholderTextColor ={colors.alternative}
                        selectionColor = {colors.secondary}
                        autoFocus={true}
                        keyboardType='numeric'
                        onChangeText={(text) => setKwhValue(text)}
                        value={kwhValue}
                        onSubmitEditing ={handleSubmit}
                    />
                    <ModalActionGroup>
                        <ModalAction color={colors.primary} onPress={handleCloseModal}>
                            <AntDesign name="close" size={28} color={colors.tertiary}/>
                        </ModalAction>
                        <ModalAction color={colors.tertiary} onPress={handleSubmit}>
                            <AntDesign name="check" size={28} color={colors.secondary}/>
                        </ModalAction>
                    </ModalActionGroup>
                    </ModalView>
                </ModalContainer>
            </Modal>
        </>
    );
}
export default InputModal;