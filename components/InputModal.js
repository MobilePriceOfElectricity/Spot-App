import React from "react";
import { Modal } from "react-native";
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
    const handleCloseModal = () => {
        setModalVisible(false);
        setApplianceInputValue("");
        setKwhValue("");
        setApplianceToBeEdited(null)
    }
    const handleSubmit = () => {
        if(!applianceToBeEdited){
        handleAddAppliance({
            title: applianceInputValue,
            kwh: kwhValue,
            key:`${(appliances[appliances.length-1] && parseInt(appliances[appliances.length-1].key)+1) || 1}`
        });
    }else {
        handleEditAppliance({
            title: applianceInputValue,
            kwh: kwhValue,
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
                        placeholderTextColor ={colors.primary}
                        selectionColor = {colors.secondary}
                        autoFocus={true}
                        onChangeText={(text) => setApplianceInputValue(text)}
                        value={applianceInputValue}
                        onSubmitEditing ={handleSubmit}
                        
                    />
                    <StyledInput 
                        placeholder="kWh"
                        placeholderTextColor ={colors.primary}
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