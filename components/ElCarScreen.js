import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useEffect, useLayoutEffect } from 'react';
import { Col, Grid, Row } from "react-native-easy-grid";
import Slider from '@react-native-community/slider';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';

const TOKEN = 'YOUR CHARGER API KEY'
const GET_URL = 'https://202683.api.v3.go-e.io/api/status?token=';
const POST_URL = 'https://202683.api.v3.go-e.io/api/set?token=';
const STORAGE_KEY = "@hinta_Key";

// BackGroundtask
let setStateFn = () => {
    //console.log("State not yet initialized");
};

// notification
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});


export async function allowsNotificationsAsync() {
    const settings = await Notifications.getPermissionsAsync();
    return (
        settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
}

//Refresh control
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const ElCarScreen = (props) => {
    const [answer, setAnswer] = useState([]);
    const [power, setPower] = useState(0)
    const [price, setPrice] = useState(0)
    const [state, setState] = useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    const [priceNow, setPriceNow] = useState([])

    useEffect(() => {
        getData()
        schedulePushNotification()
        StorePrice()
        GetPrice()
    }, [])

    //Refresh Control
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
        setAnswer([])
        getData()
        clearAsyncStorage()
        StorePrice()
    }, []);

    //Save current price
    const StorePrice = async () => {
        try {
            const jsonValue = JSON.stringify(props.price)
            await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
        } catch (e) {
            // saving error
        }
    }

    const GetPrice = async () => {
        try {
            return AsyncStorage.getItem(STORAGE_KEY)
                .then(req => JSON.parse(req))
                .then(json => {
                    if (json === null) {
                        json = [];
                    }
                    setPriceNow(json);
                })
                .catch(error => console.log(error));
        } catch (e) {
            console.log(e);
        }
    }
    const clearAsyncStorage = async () => {
        AsyncStorage.removeItem(STORAGE_KEY);
    }

    // Background Task
    setStateFn = setState;
    const GetCharge = 'getData'
    async function getData() {
        async function initBackgroundFetch(GetChargeData,
            taskFn,
            interval = 60 * 1,) {
            try {
                if (!TaskManager.isTaskDefined(GetChargeData)) {
                    TaskManager.defineTask(GetChargeData, taskFn);
                }
                const options = {
                    minimumInterval: interval = 60 * 1// Minute
                };
                await BackgroundFetch.registerTaskAsync(GetChargeData, options);
            } catch (err) {
                return { err }
            }
        }
        try {
            await fetch(GET_URL + TOKEN)
                .then(resp => resp.json())
                .then(data => {
                    const parseData =
                    {
                        name: data.fna, // Laturin nimi
                        amp: data.amp, // Latausvirran status
                        Charge: data.frc, // lataa = 1, lataus pois = 0
                        Vol1: data.nrg[0], Vol2: data.nrg[1], Vol3: data.nrg[2], // Jokaisen vaiheen V
                        CurAmp1: data.nrg[4], CurAmp2: data.nrg[5], CurAmp3: data.nrg[6], // Lataus hetken Amp
                        CurkW1: data.nrg[7], CurkW2: data.nrg[8], CurkW3: data.nrg[9], // Lautaus hetken kW
                        cbl: data.cbl,
                        EnergyNow: data.wh, // Lataus energia nyt
                        EnergyTotalNow: data.dwo, //ladattu energia
                        EnergyTotal: data.etop, // energia yhteensä
                        ecoMode: data.awp, // ecomoden hintaraja
                        status: data.car // status

                    };
                    setAnswer(parseData)
                    setStateFn(parseData);
                })
                .catch(e => console.log(e))
            return backendData
                ? BackgroundFetch.Result.NewData
                : BackgroundFetch.Result.NoData;
        } catch (err) {
        }
        initBackgroundFetch(GetCharge, getData, 5);
    }

    //Power slider
    const min = 6;
    const max = 16;
    const valueAmp = 10;

    //Energy info
    const energyNow = answer.EnergyTotalNow
    const energyThisCharge = answer.EnergyTotalNow
    const energyTotal = answer.EnergyTotal

    //Price Slider
    const eurMin = 5;
    const eurMax = 80;
    const valuePrice = 20;

    if (!answer) {
        return null;
    }

    // Notification 
    async function schedulePushNotification() {

        const hasPushNotificationPermissionGranted = await allowsNotificationsAsync()
        if (hasPushNotificationPermissionGranted && priceNow > answer.ecoMode) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Auton laturi varoittaa!",
                    body: 'Tämän hetkinen hinta ylittää asettamasi rajan. Nyt ei ole sopiva hetki ladata autoa',
                    data: { data: 'goes here' },
                },
                trigger: { seconds: 2 },
            });

        }
    }

    //Post Amper to cloud
    async function PostPower() {
        const requestOptions = {
            headers: { 'Content-Type': 'application/json' },
        };
        try {
            await fetch(POST_URL + TOKEN + '&amp=' + power, requestOptions)
                .then(response => {
                    response.json()
                        .then(data => {
                            console.log('ok', data)
                        });
                })
        }
        catch (error) {
            console.error(error);
        }
    }

    //Post price limit to cloud
    async function PostPrice() {
        const requestOptions = {
            headers: { 'Content-Type': 'application/json' },
        };
        try {
            await fetch(POST_URL + TOKEN + '&awp=' + price, requestOptions)
                .then(response => {
                    response.json()
                        .then(data => {
                            console.log('ok', data)
                        });
                })
        }
        catch (error) {
            console.error(error);
        }
    }

    //Check charger status
    let status = ''
    if (answer.status === 1) {
        status = 'Ei autoa'
    }
    if (answer.status === 2) {
        status = 'Ladataan'
    }
    if (answer.status === 3) {
        status = 'Odotetaan autoa'
    }
    if (answer.status === 4) {
        status = 'Lataus valmis'
    }

    return (
        <View style={styles.home}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["yellow", "orange","red", "blue", "pink"]}
                        size="large"
                        progressBackgroundColor={"black"}
                    />
                }
            >
                <Text style={styles.boldText}>{answer.name}</Text>
                <View>
                    <Grid>
                        <Row style={styles.onOff}>
                            <Col><Text style={styles.boldText}>{status}</Text></Col>
                        </Row>
                        <Row>
                            <Text style={styles.text}>Latausvirta {power}A</Text>
                        </Row>
                        <Row style={styles.row}>
                            <Col size={10}><Text style={styles.sliderText}>{min}A</Text></Col>
                            <Col size={70}>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={min}
                                    maximumValue={max}
                                    step={1}
                                    value={valueAmp}
                                    onValueChange={(val) => (setPower(val), PostPower())}
                                    minimumTrackTintColor="orange"
                                    maximumTrackTintColor="#a6d3d8"
                                />
                            </Col>
                            <Col size={10}><Text style={styles.sliderText}>{max}A</Text></Col>
                        </Row>
                    </Grid>
                </View>
                <Text style={styles.boldText}>Lataus info: </Text>
                <Text style={styles.text}>{answer.Vol1}V, {answer.Vol2}V, {answer.Vol3}V</Text>
                <Text style={styles.text}>{answer.CurAmp1}A, {answer.CurAmp2}A, {answer.CurAmp3}A</Text>
                <Text style={styles.text}>{answer.CurkW1}kW, {answer.CurkW2}kW, {answer.CurkW3}kW</Text>
                <Row style={styles.eco}>
                    <Col><Text style={styles.boldText}>Hinta hälytys</Text></Col>
                </Row>
                <Text style={styles.text}>Sähkön hinta nyt: {priceNow} snt/kWh</Text>
                <Text style={styles.text}>Hintaraja: {price} snt/kWh</Text>
                <Row style={styles.row}>
                    <Col size={10}><Text style={styles.sliderText}>{eurMin} snt/kWh</Text></Col>
                    <Col size={70}>
                        <Slider
                            style={styles.slider}
                            minimumValue={eurMin}
                            maximumValue={eurMax}
                            step={5}
                            value={valuePrice}
                            onValueChange={(val) => (setPrice(val), PostPrice())}
                            minimumTrackTintColor="orange"
                            maximumTrackTintColor="#a6d3d8"
                        />
                    </Col>
                    <Col size={10}><Text style={styles.sliderText}>{eurMax}snt/kWh</Text></Col>
                </Row>
                <Text style={styles.boldText}>Energia tiedot: </Text>
                <Text style={styles.text}>Energia nyt: {(energyNow * 0.001).toFixed(2)}kW</Text>
                <Text style={styles.text}>Energia tällä latauksella: {(energyThisCharge * 0.001).toFixed(2)}kW</Text>
                <Text style={styles.text}>Energia yhteensä: {(energyTotal * 0.001).toFixed(2)}kW</Text>
            </ScrollView>
        </View>
    );
}
export { ElCarScreen }

/* const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        width: deviceWidth
    },
    text: {
        fontSize: 15
    },
    boldText: {
        fontSize: 25,
        fontWeight: 'bold',
        marginTop: 20
    },
    switch: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
        marginLeft: 30
    },
    slider: {
        width: 150,
        height: 40,
        marginLeft: 20
    },
    sliderText: {
        fontSize: 11,
    },
    onOff: {
        marginBottom: 30
    },
    eco: {
        marginBottom: 30
    },
    switch1: {
        transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
        marginLeft: 30
    },
}); */