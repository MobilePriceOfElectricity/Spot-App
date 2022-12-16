import React from 'react';
import {Text, View, Dimensions, ScrollView, RefreshControl, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import moment from 'moment';
import { useState, useEffect, useLayoutEffect } from 'react';
import { LoadingIcon } from './LoadingIcon';
import DropDownPicker from 'react-native-dropdown-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';

//import styles from '../styles/styles';
const STORAGE_KEY = "@Down_Key";
const STORAGE_KEY2 = "@Up_Key";

//Refresh control
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const PriceListScreen = () => {
    const [isLoaded, setIsLoaded] = useState();
    const [today, setToday] = useState([])
    const [nextDay, setNextDay] = useState([])
    const [data, setData] = useState([])
    const [hour, setHour] = useState();
    const [alv, setAlv] = useState(24);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Tämä päivä', value: 'Today' },
        { label: 'Seuraava päivä (julkaistaan klo 14)', value: 'Tomorrow' },
    ]);

    //Refresh Control
    const [refreshing, setRefreshing] = React.useState(false);
 
    const [downLimit, setDownLimit] = useState('')
    const [upLimit, setUpLimit] = useState('')

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
                //console.log(res[0]['24h'])
                setToday(res[0]['24h'])
            })
        setIsLoaded(true)
    }

    const fetchNextDay = () => {
        fetch('http://www.students.oamk.fi/~n0juro00/MobiiliProjekti/GetEnstoeeNextDayData.php', {
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
                //console.log(res[0]['24h'])
                setNextDay(res[0]['24h'])
            })
        setIsLoaded(true)
    }

    useEffect(() => {
        fetchToday()
        fetchNextDay()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
        setDataToRender()
        getValueFunction()
        getUpValueFunction()
    }, [])

       // Alv arvot
       const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 0 }];

    //flat list
        const Item = ({ time,price }) => (
            <View style={[
                ((100 + alv) / 100 * price).toFixed(2) <= downLimit ? styles.low : styles.item,
                ((100 + alv) / 100 * price).toFixed(2) > downLimit && ((100 + alv) / 100 * price).toFixed(2) < upLimit ? styles.middle : styles.item,
                ((100 + alv) / 100 * price).toFixed(2) >= upLimit ? styles.high : styles.item,
                styles.item]}>
              <Text style={styles.title}>Klo: {time}.00 | { ((100 + alv) / 100 * price).toFixed(2)}snt/kWh</Text>
            </View>
          );
          const renderItem = ({ item }) => (
            <Item time={item.time} price={item.price} />
          );
   
            const setDataToRender = () => {
                if (value === 'Today' || value === null) {
                    setData(today.slice(0,25))
                } if (value === 'Tomorrow') {
                    setData(nextDay)
                }
            }

        //Refresh Control
        const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
        fetchToday()
        fetchNextDay()
        getValueFunction()
        getUpValueFunction()
    }, []);

    const getValueFunction = () => {
        AsyncStorage.getItem(STORAGE_KEY).then(
          (value) =>
            setDownLimit(value)
        );
      };
    
      const getUpValueFunction = () => {
        AsyncStorage.getItem(STORAGE_KEY2).then(
          (value) =>
            setUpLimit(value)
        );
      };

    if (!isLoaded) {
        return (<LoadingIcon />)
    } else {
    return(
        <View style={styles.home}>
            
                        <View style={[{ marginBottom: 20, marginTop: 20 }]}>
                        <RadioForm
                            //style={theme.radio}
                            buttonSize={10}
                            buttonOuterSize={20}
                            radio_props={alvData}
                            initial={0}
                            onPress={(value) => { setAlv(value)}}
                            buttonColor={'#D4850E'}
                            selectedButtonColor={'#D4850E'}
                            labelColor={'#a6d3d8'}
                            selectedLabelColor={'#a6d3d8'}
                            formHorizontal={true}
                            labelHorizontal={false}

                        />
                    </View>
                    <View>
                        <DropDownPicker
                            theme="DARK"
                            placeholder='Valitse päivä'
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            //defaultIndex={0}
                            containerStyle={{ height: 30 }}
                            onChangeItem={item => setValue(item.value)}
                            onChangeValue={val => setDataToRender(val)}
                        />
                    </View>         
        <SafeAreaView style={[styles.container, {marginTop: 30}]}>
            <FlatList
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
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.time}
            />
          </SafeAreaView>
        </View>
    );
}
}

export {PriceListScreen}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16171d',
      },
      home: {
        flex: 1,
        backgroundColor: '#16171d',
        alignItems: 'center',
        justifyContent: 'center', 
      },
    item: {
        backgroundColor: '#1f2131',
        padding: 10,
        marginVertical: 12,
        marginHorizontal: 20,
        borderRadius: 100,
        //paddingHorizontal: 40,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 15,
        shadowRadius: 50
      },
      low: {shadowColor: 'green'},
      middle: {shadowColor: 'orange'},
      high: {shadowColor: 'red'},
      title: {
        fontSize: 16,
        fontFamily: "MontserratRegular",
        color: '#a6d3d8',
    },
    normal: {
        color: 'red'
      },
    current: {
        color: 'yellow'
      },
  });