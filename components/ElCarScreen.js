import {View, Text, ScrollView, FlatList, Switch, Dimensions } from 'react-native';
import { useState } from 'react';
import { useEffect } from 'react';
import { Col, Grid, Row } from "react-native-easy-grid";
import Slider from '@react-native-community/slider';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from "expo-notifications";
import styles from '../styles/styles';

//let deviceWidth = Dimensions.get('window').width
const TOKEN = 'EWlUGgyLmgDNIOmrykKzGlwn1p3SrdZY'
const GET_URL = 'https://202683.api.v3.go-e.io/api/status?token=';
const POST_URL = 'https://202683.api.v3.go-e.io/api/set?token=';


// BackGroundtask
let setStateFn = () => {
    console.log("State not yet initialized");
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

const ElCarScreen = () => {
    const [chargerIsOn, setChargerIsOn] = useState(false);
    const [ecoIsOn, setEcoIsOn] = useState(false);
    const [answer, setAnswer] = useState([]);
    const [power, setPower] = useState(0)
    const [price, setPrice] = useState(0)
    const [state, setState] = useState(null);

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
                        EnergyTotalNow: data.eto, //ladattu energia
                        EnergyTotal: data.etop, // energia yhteensä
                        ecoMode: data.awp // ecomoden hintaraja

                    };
                    setAnswer(parseData)
                    console.log("getData() ", answer);
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

    useEffect(() => {
        // notification
        schedulePushNotification()
        // Send power to cloud
        PostPower()
        // Hakee dataa
        getData()
    }, [])

    // Lataus päälle/pois
    const chargerOn = () => setChargerIsOn(previusState => !previusState)

    // Latausvirran säätö
    const min = 6;
    const max = 32;
    const valueAmp = answer      .amp
    console.log(valueAmp)
    // eco mode
    const ecoOn = () => setEcoIsOn(previusState => !previusState)
    //Hintaraja
    const eurMin = 5;
    const eurMax = 80;

    if (!answer) {
        return null;
    }

    // Notification 
    async function schedulePushNotification() {

        const hasPushNotificationPermissionGranted = await allowsNotificationsAsync()
        console.log(hasPushNotificationPermissionGranted)
        if (hasPushNotificationPermissionGranted && answer.amp > 24) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Vaara",
                    body: 'Nyt tulee virtaa niin että johdot on punaiset ja sulakkeet paukkuu',
                    data: { data: 'goes here' },
                },
                trigger: { seconds: 2 },
            });

        }
    }
    
    // Post Amper to cloud
    async function PostPower() {
        const requestOptions = {
            headers: { 'Content-Type': 'application/json' },  
        };
            try {
                await fetch(POST_URL + TOKEN + '&amp=' + power , requestOptions)
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

    return (

        <View style={styles.home}>
            <ScrollView>
                <Text style={styles.boldText}>{answer.name}</Text>
                <View>
                    <Grid>
                        <Row style={styles.onOff}>
                            <Col size={50}><Text style={styles.boldText}>Aloita lataus</Text></Col>
                            <Col size={20}>
                                <Switch
                                    value={chargerIsOn}
                                    onValueChange={chargerOn}
                                    style={styles.switch}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Text style={styles.text}>Latausvirta {answer.amp}A</Text>
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
                                    onValueChange={(val) => (setPower(val), PostPower(), getData())}
                                    minimumTrackTintColor="red"
                                    maximumTrackTintColor="green"
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
                    <Col size={50}><Text style={styles.boldText}>Eco-Tila:</Text></Col>
                    <Col size={20}>
                        <Switch
                            value={ecoIsOn}
                            onValueChange={ecoOn}
                            style={styles.switch1}
                        />
                    </Col>
                </Row>
                <Text style={styles.text}>Hintaraja: {answer.ecoMode} snt/kWh</Text>
                <Row style={styles.row}>
                    <Col size={10}><Text style={styles.sliderText}>{eurMin} snt/kWh</Text></Col>
                    <Col size={70}>
                        <Slider
                            style={styles.slider}
                            minimumValue={eurMin}
                            maximumValue={eurMax}
                            step={1}
                            value={10}
                            onValueChange={(val) => setPrice(val)}
                            minimumTrackTintColor="red"
                            maximumTrackTintColor="green"
                        />
                    </Col>
                    <Col size={10}><Text style={styles.sliderText}>{eurMax}snt/kWh</Text></Col>
                </Row>
                <Text style={styles.boldText}>Energia tiedot: </Text>
                <Text style={styles.text}>Energia nyt: {answer.EnergyNow}kW</Text>
                <Text style={styles.text}>Energia tällä latauksella: {answer.EnergyTotalNow}kW</Text>
                <Text style={styles.text}>Energia yhteensä: {answer.EnergyTotal}kW</Text>
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