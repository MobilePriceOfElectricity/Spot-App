import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useEffect } from 'react';
import { Col, Grid, Row } from "react-native-easy-grid";
import Slider from '@react-native-community/slider';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from "expo-notifications";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { responsiveWidth } from "react-native-responsive-dimensions";
import { LoadingIcon } from './LoadingIcon';
import styles from '../styles/styles';
//import { useRoute } from '@react-navigation/native';


//liittyy fetchiin
import moment from 'moment';

//tpjlSFgUj0nh9xBWHj57UwmUtG5EV2Bz

const TOKEN = 'tpjlSFgUj0nh9xBWHj57UwmUtG5EV2Bz'
const GET_URL = 'https://202683.api.v3.go-e.io/api/status?token=';
const POST_URL = 'https://202683.api.v3.go-e.io/api/set?token=';

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

const ElCarScreen = ({ route }) => {
    const [isLoaded, setIsLoaded] = useState();
    const [answer, setAnswer] = useState([]);
    const [power, setPower] = useState(0)
    const [hourPrice, setHourPrice] = useState([])
    const [priceLimit, setPriceLimit] = useState([])
    const [state, setState] = useState(null);
    const [refreshing, setRefreshing] = React.useState(false);
    //const [priceNow, setPriceNow] = useState([])
    //const [isOn, setisOn] = useState([])


    //liittyy fetchiin
    const [hour, setHour] = useState();


    //liittyy fetchiin
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
                //console.log(res[0]['24h'])
                setHourPrice(res[0]['24h'])
            })
        setIsLoaded(true)
    }

    useEffect(() => {
        //console.log(route.params.hinta)
        //console.log(route.params.id)
        //setPrice1(props.price)
        fetchToday()
        getData()
        schedulePushNotification()

        //liittyy fetchiin
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
    }, [])


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


    //Liittyy fetchiin
        //Tarkista kello
        let priceNow = ''
        for (let i = 0; i < hourPrice.length; i++)
            if (hour === hourPrice[i].time) {
                priceNow = ((100 + 10) / 100 * hourPrice[i].price).toFixed(2)
            }

    //console.log(priceNow)


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
    const valuePrice = 70;

    if (!answer) {
        return null;
    }

    // Notification 
    async function schedulePushNotification() {

        const hasPushNotificationPermissionGranted = await allowsNotificationsAsync()
        if (hasPushNotificationPermissionGranted && priceLimit < priceNow) {
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

    //Tässä on pelkkä props
    //console.log(props.price)

    //Tässä asyncStorageen tallennettu props
    //console.log(priceNow)

    // Tässä sliderin value
    //console.log(price)

    //Refresh Control
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
        setAnswer([])
        getData()
        fetchToday()
        schedulePushNotification()
    }, []);

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
                            //console.log('ok', data)
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
            await fetch(POST_URL + TOKEN + '&awp=' + priceNow, requestOptions)
                .then(response => {
                    response.json()
                        .then(data => {
                            //console.log('ok', data)
                        });
                })
        }
        catch (error) {
            console.error(error);
        }
    }

    //Check charger status
    const StatusIcon = () => {
        //let status = ''
        if (answer.status === 1) {
            return (
                <View>
                    <MaterialCommunityIcons name="sleep" size={24} color="orange" />
                    <Ionicons name="car-sport" size={70} color="orange" />
                </View>
                // ei autoa kytketty
            )
        }
        if (answer.status === 2) {
            <View>
                <Ionicons name="ios-flash-sharp" size={30} color="orange" />
                <Ionicons name="car-sport" size={70} color="orange" />
            </View>
            // Ladataan
        }
        if (answer.status === 3) {
            <View>
                <MaterialCommunityIcons name="sleep" size={24} color="orange" />
                <Ionicons name="car-sport" size={70} color="orange" />
            </View>
            // Odotetaan autolta lupaa
        }
        if (answer.status === 4) {
            <View>
                <MaterialIcons name="done-outline" size={24} color="orange" />
                <Ionicons name="car-sport" size={70} color="orange" />
            </View>
            // lataus valmis
        }
    }

    //const route = useRoute();

    //console.log(route.params.price)

    //const {pricenytte, ID} = route.params
    //const { hinta, id } = route.params;

    //console.log(route.params.hinta)


    if (!isLoaded) {
        return (<LoadingIcon />)
    } else {
    return (
        <View style={styles.container}>
            <View style={responsiveWidth(90)}>
                <ScrollView style={[{ marginBottom: 20, marginTop: 20 }]}
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
                >
                    <Text style={[styles.text, {
                        marginBottom: 0, fontSize: 20, fontWeight: '700', letterSpacing: 2, textAlign: 'center'
                    }]}>{answer.name}</Text>
                    <View>
                        <View style={styles.home}>
                            <Col style={{ alignItems: 'center', marginTop: 30, marginBottom: 50 }}>
                                <View style={{
                                    width: 155,
                                    height: 155,
                                    backgroundColor: 'black',
                                    borderRadius: 100,
                                    //paddingHorizontal: 40,
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: "orange",
                                    //shadowOpacity: 5,
                                    elevation: 30,
                                    shadowRadius: 50
                                }}>
                                    <Text style={styles.text}>{StatusIcon()}</Text>
                                </View>
                            </Col>
                        </View>
                        <Grid>
                        <Text style={[styles.text, { textAlign: 'center', fontSize: 18, marginBottom: 20 }]}>Latausvirta {power}A</Text>
                            <Row style={styles.row}>
                                <Col size={15}><Text style={[styles.text, { fontSize: 12, textAlign: 'right', marginBottom: 10 }]}>{min}A</Text></Col>
                                <Col size={70}>
                                    <Slider
                                        style={{transform: [{ scaleY: 2 }] }}
                                        minimumValue={min}
                                        maximumValue={max}
                                        step={1}
                                        value={valueAmp}
                                        onValueChange={(val) => (setPower(val), PostPower())}
                                        minimumTrackTintColor="orange"
                                        maximumTrackTintColor="#a6d3d8"
                                        thumbTintColor='#a6d3d8'
                                    />
                                </Col>
                                <Col size={15}><Text style={[styles.text, { fontSize: 12, textAlign: 'left' }]}>{max}A</Text></Col>
                            </Row>
                            <Row>
                                <Col>
                                    <View style={styles.home}>
                                       
                                        <Col style={{ alignItems: 'center', marginTop: 30, marginBottom: 50, marginLeft:50 }}>
                                            <View style={{
                                                width: 80,
                                                height: 80,
                                                marginBottom:10,
                                                backgroundColor: 'black',
                                                borderRadius: 100,
                                                //paddingHorizontal: 40,
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                shadowColor: "orange",
                                                //shadowOpacity: 5,
                                                elevation: 30,
                                                shadowRadius: 50
                                            }}>
                                                <Text style={[styles.text, { textAlign: 'center', fontSize: 16 }]}>{(priceNow * 0.01).toFixed(2)} €</Text>
                                            </View>
                                            <MaterialCommunityIcons name="home-lightning-bolt-outline" size={24} color="#a6d3d8" />
                                        </Col>
                                    </View>
                                </Col>
                                <Col>
                                    <View style={styles.home}>
                                        <Col style={{ alignItems: 'center', marginTop: 30, marginBottom: 50, marginRight:50 }}>
                                            <View style={{
                                                width: 80,
                                                height: 80,
                                                marginBottom:10,
                                                backgroundColor: 'black',
                                                borderRadius: 100,
                                                //paddingHorizontal: 40,
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                shadowColor: "orange",
                                                //shadowOpacity: 5,
                                                elevation: 30,
                                                shadowRadius: 50
                                            }}>
                                                <Text style={[styles.text, { textAlign: 'center', fontSize: 16}]}>{(priceLimit * 0.01).toFixed(2)} €</Text>
                                            </View>
                                            <MaterialIcons name="notifications-on" size={24} color="#a6d3d8" />
                                        </Col>
                                    </View>
                                </Col>
                            </Row>
                            <Text style={[styles.text, { textAlign: 'center', fontSize: 18, marginBottom: 20 }]}>Aseta hinta varoitus</Text>
                            <Row style={styles.row}>
                                <Col size={15}><Text style={[styles.text, { fontSize: 12, textAlign: 'right' }]}>{eurMin} snt/kWh</Text></Col>
                                <Col size={70}>
                                    <Slider
                                        style={{transform: [{ scaleY: 2 }] }}
                                        minimumValue={eurMin}
                                        maximumValue={eurMax}
                                        step={5}
                                        value={valuePrice}
                                        onValueChange={(val) => (setPriceLimit(val), PostPrice())}
                                        minimumTrackTintColor="orange"
                                        maximumTrackTintColor="#a6d3d8"
                                        thumbTintColor='#a6d3d8'
                                    />
                                </Col>
                                <Col size={15}><Text style={[styles.text, { fontSize: 12, textAlign: 'left'  }]}>{eurMax}snt/kWh</Text></Col>
                            </Row>
                        </Grid>
                    </View>


                    <Grid>
                        <Row>
                            <Col>
                            <Text style={[styles.text, { fontSize: 20, marginTop: 20, marginBottom:10, textAlign: 'center'}]}>Lataus info: </Text>
                            </Col>
                        
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{answer.Vol1}V</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.Vol2}V</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.Vol3}V</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{answer.CurAmp1}A</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.CurAmp2}A</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.CurAmp3}A</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{answer.CurkW1}kW</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.CurkW2}kW</Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:30 }]}>{answer.CurkW3}kW</Text>
                            </Col>
                        </Row>
                    </Grid>

                    <Grid style={[styles.text, {marginTop:20, marginBottom:50 }]}>
                        <Row>
                            <Col>
                            <Text style={[styles.text, { fontSize: 20, marginBottom:10, textAlign: 'center' }]}>Energia tiedot: </Text>
                            </Col>
    
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>Energia nyt: </Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{(energyNow * 0.001).toFixed(2)}kW</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>Tällä latauksella: </Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{(energyThisCharge * 0.001).toFixed(2)}kW</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>Yhteensä: </Text>
                            </Col>
                            <Col>
                                <Text style={[styles.text, { fontSize: 16, marginLeft:50 }]}>{(energyTotal * 0.001).toFixed(2)}kW</Text>
                            </Col>
                        </Row>
                    </Grid>
                </ScrollView>
            </View>
        </View>
    );
}
}
export { ElCarScreen }