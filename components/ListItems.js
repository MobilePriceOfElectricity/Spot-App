import React,{useState, useEffect} from "react";
import {SwipeListView} from "react-native-swipe-list-view"
import {Entypo} from "@expo/vector-icons"

//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ListView,
    ListViewHidden,
    KwhValues,
    ApplianceText,
    HiddenButton,
    SwipedApplianceText,
    Sum,
    colors
} from "../styles/appStyles"
const ListItems = ({appliances,setAppliances,handleTriggerEdit}) => {

    const [swipedRow, setSwipedRow] = useState(null);



    const handleDeleteAppliance = (rowMap, rowKey)=>{

        const newAppliances = [...appliances];
        const applianceIndex = appliances.findIndex((appliance) => appliance.key === rowKey);
        newAppliances.splice(applianceIndex,1);

        AsyncStorage.setItem("storedAppliances",JSON.stringify(newAppliances)).then(() => {
            setAppliances(newAppliances);
        }).catch(error =>
            console.log(error))
    }
    return (
        <>
            {appliances.length == 0 && <ApplianceText>Lista on tyhjä - Et ole vielä lisännyt yhtään kodinkonetta.</ApplianceText>}
            {appliances.length != 0 && 
            <SwipeListView
                data={appliances}
                renderItem={(data) => {
                    const RowText = data.item.key == swipedRow ? SwipedApplianceText: ApplianceText
                    return (
                        <ListView
                            underlayColor={colors.primary}
                            onPress={()=>{
                                handleTriggerEdit(data.item)
                            }}>
                            <>
                            <RowText>{data.item.title}</RowText>
                            <KwhValues>{data.item.kwh} kWh</KwhValues>
                            <Sum>{data.item.summa} € / h</Sum>
                            </>
                        </ListView>
                    )
                }} renderHiddenItem={(data,rowMap) => {
                    return(
                        <ListViewHidden>
                            <HiddenButton onPress={() => handleDeleteAppliance(rowMap,data.item.key)} 
                            >
                                <Entypo name = "trash" size={25} color={colors.secondary} />
                            </HiddenButton>
                        </ListViewHidden>
                    )
                }}
                
                leftOpenValue={80}
                previewRowKey={"1"}
                previewOpenValue={80}
                previewOpenDelay={3000}
                disableLeftSwipe={true}
                showsVerticalScrollIndicator={false}
                style={{
                    flex: 1, paddingBottom: 30, marginBottom: 40
                }}
                onRowOpen={(rowKey) => {
                    setSwipedRow(rowKey);

                }}
                onRowClose={() => {
                    setSwipedRow(null)
                }}
            />
        }</>
    );
    }

export default ListItems;