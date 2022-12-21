import React from 'react';
import { Text, View, Button,  RefreshControl, FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import RadioForm  from 'react-native-simple-radio-button';
import moment from 'moment';
import { useState, useEffect} from 'react';
import { LoadingIcon } from './LoadingIcon';
import DropDownPicker from 'react-native-dropdown-picker'
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@Down_Key";
const STORAGE_KEY2 = "@Up_Key";

//Refresh control
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const PriceListScreen = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [today, setToday] = useState([])
    const [nextDay, setNextDay] = useState([])
    const [data, setData] = useState()
    const [hour, setHour] = useState();
    const [alv, setAlv] = useState(24);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('Today');
    const [items, setItems] = useState([
        { label: 'Tämä päivä', value: 'Today' },
        { label: 'Seuraava päivä (julkaistaan klo 14)', value: 'Tomorrow' },
    ]);

    const [isEnabled, setIsEnabled] = useState(false);

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
                setToday(res[0]['24h'])
            })
            .finally(setIsLoaded(true))
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
                setNextDay(res[0]['24h'])
            })
            .finally(setIsLoaded(true))
    }

    useEffect(() => {
        fetchToday()
        fetchNextDay()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
        getValueFunction()
        getUpValueFunction()
    }, [])

    // Alv
    const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 0 }];

    //flatlist
    const Item = ({ time, price }) => (
        <View style={[
            ((100 + alv) / 100 * price) <= downLimit ? styles.low : styles.item,
            ((100 + alv) / 100 * price) > downLimit && ((100 + alv) / 100 * price).toFixed(2) < upLimit ? styles.middle : styles.item,
            ((100 + alv) / 100 * price) >= upLimit ? styles.high : styles.item,
            styles.item]}>
            <Text style={styles.title}>Klo: {time}.00 | {((100 + alv) / 100 * price).toFixed(2)}snt/kWh</Text>
        </View>
    );
    const renderItem = ({ item }) => (
        <Item time={item.time} price={item.price} />
    );

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

    const onPressTD = () => [setValue('Today'), setData(today.slice(0, 25), setIsEnabled(false))];
    const onPressTM = () => [setValue('Tomorrow') , setData(nextDay), setIsEnabled(true)];

    if (!isLoaded) {
        return (<LoadingIcon />)
    } else {
        return (
            <View style={styles.home}>
                <View style={[{ marginBottom: 20, marginTop: 20, flexDirection: 'row' }]}>
                <TouchableOpacity
                    onPress={onPressTD}
                    style={styles.button}
                    >
                        <Text style={[styles.text, { color: '#a6d3d8', fontSize: 18 }]}>
                        Tänään
                        </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onPressTM}
                    style={styles.button}
                    >
                        <Text style={[styles.text, { color: '#a6d3d8', fontSize: 18 }]}>
                        huomenna
                        </Text>
                </TouchableOpacity>
                </View>
                <Text style={[styles.text, {fontSize: 20}]}>{isEnabled ? 'Huomisen hinnat' : 'Tämän päivän hinnat'}</Text>
                <SafeAreaView style={[styles.container, { marginTop: 30 }]}>
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
                        data={isEnabled ? data : today.slice(0, 25)}
                        renderItem={renderItem}
                        keyExtractor={item => item.time}
                    />
                </SafeAreaView>
            </View>
        );
    }
}

export { PriceListScreen }

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
    text: {
        color: '#a6d3d8',
        fontFamily: "MontserratRegular"
    },
    text2: {
        color: '#d4850e',
        fontFamily: "MontserratRegular"
      },
    item: {
        backgroundColor: '#1f2131',
        padding: 10,
        marginVertical: 12,
        marginHorizontal: 20,
        borderRadius: 100,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 15,
        shadowRadius: 50
    },
    low: { shadowColor: 'green' },
    middle: { shadowColor: 'orange' },
    high: { shadowColor: 'red' },
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
    button: {
        marginHorizontal: 8,
        alignItems: 'center',
        backgroundColor: '#1f2131',
        borderRadius: 10,
        padding: 5,
        marginTop: 10,
        shadowColor: "#d4850e",
        //elevation: 5
        borderWidth: 0.5,
        borderColor: '#d4850e',
        
      },
});
