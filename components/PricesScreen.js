import React from 'react';
import 'react-native-gesture-handler';
import { Animated, Text, View, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useLayoutEffect } from 'react';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from "react-native-chart-kit";
import { Col, Grid } from 'react-native-easy-grid'
import moment from 'moment';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import styles from '../styles/styles';
import DropDownPicker from 'react-native-dropdown-picker'
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from "expo-notifications";
import {
    responsiveWidth
} from "react-native-responsive-dimensions";
import { ElCarScreen } from './ElCarScreen';
import { AppliancesScreen } from './AppliancesScreen'

const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const URL = 'https://web-api.tp.entsoe.eu/api?'
const TOKEN = 'securityToken=419b446b-122c-414f-8586-fc7d6ff39def'
const DOCTYPE = '&documentType=A44'
const OUT_BIDD_ZONE = '&outBiddingZone_Domain=10YFI-1--------U'
const IN_DOM = '&in_Domain=10YFI-1--------U'
const OUT_DOM = '&out_Domain=10YFI-1--------U'

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

const PricesScreen = () => {
    const [answer, setAnswer] = useState();
    const [hour, setHour] = useState();
    const [allData, setAllData] = useState();
    const [alv, setAlv] = useState(24);
    //dropdown
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Tämä päivä', value: 'Today' },
        { label: 'Edelliset 7 vrk', value: 'LastSeven' },
        { label: 'Edelliset 31 vrk', value: 'LastMonth' },
    ]);

    const [state, setState] = useState(null);

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);

    // Background Task
    setStateFn = setState;
    const getPrice = 'getPriceData'

    async function getPriceData() {
        async function initBackgroundFetch(GetPriceData,
            taskFn,
            interval = 60 * 1) {
            try {
                if (!TaskManager.isTaskDefined(GetPriceData)) {
                    TaskManager.defineTask(GetPriceData, taskFn);
                }
                const options = {
                    minimumInterval: interval = 60 * 1// Minute
                };
                await BackgroundFetch.registerTaskAsync(GetPriceData, options);
            } catch (err) {
                return { err }
            }
        }
        try {
            //let interval = setInterval(() => {
            // Get date, the previous seven days and the previous 31 days
            let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
            let dayAhead = moment().add(1, 'd').format('YYYYMMDDHH00')
            let lastMonth = moment().subtract(31, 'd').format('YYYYMMDDHH00')
            setHour(curDate.substring(8, 10))
            await fetch(URL + TOKEN + DOCTYPE + OUT_BIDD_ZONE + '&periodStart=' + lastMonth + '&periodEnd=' + dayAhead + IN_DOM + OUT_DOM)
                .then(resp => resp.text())
                .then(data => {
                    let XMLParser = require('react-xml-parser');
                    const xml = new XMLParser().parseFromString(data);
                    setAnswer(xml.getElementsByTagName('Price'))
                    setAllData(xml.getElementsByTagName('Period'))
                })
                .catch(e => console.log(e))
            return backendData
                ? BackgroundFetch.Result.NewData
                : BackgroundFetch.Result.NoData;
        } catch (err) {
        }

        initBackgroundFetch(getPrice, getPriceData, 5);
    }

    useEffect(() => {
        getPriceData()
        schedulePushNotification()
    }, [])


    if (!answer) {
        return null;
    }
    if (!allData) {
        return null;
    }

    // Alv arvot
    const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 1 }];


    // Hakee ajan mukaan dataa eri kohdasta
    let today = '';
    let tomorrow = ''
    if (hour < '14') {
        today = answer.slice(-24).map(val => ((100 + alv) / 100 * val.value * 0.1));
        tomorrow = new Array(24).fill(0);
    } else {
        today = answer.slice(-48, -24).map(val => ((100 + alv) / 100 * val.value * 0.1));
        tomorrow = answer.slice(-24).map(val => ((100 + alv) / 100 * val.value * 0.1));
    }

    const lastWeek = answer.slice(-168).map(val => val.value);
    const last31 = answer.slice(-744).map(val => val.value);

    // Tämän hetkinen hinta
    const period = allData.map(period => period.children);
    let point = period[32].map((point) => point.children.map(({ name, value }) => ({ [name]: value })))


    let newData = []
    for (let i = 2; i < point.length; i++) {
        const item = point[i]
        const position = ('0' + item[0].position).slice(-2)
        const price = item[1].price
        newData.push({ price: price, time: position });
    }

    let sum = ''
    for (let i = 0; i < newData.length; i++)
        if (hour === newData[i].time || hour === '00' && newData[i].time === '01') {
            sum = ((100 + alv) / 100 * newData[i].price * 0.1).toFixed(2)
        } if (hour === '00') {
            sum = answer.slice(-25, -24).map(val => ((100 + alv) / 100 * val.value * 0.1).toFixed(2))
        }

    // Min, AVG, MAX
    // Today
    let todayMin = '';
    let todayMax = '';
    if (hour < '14') {
        todayMin = Math.min(...answer.slice(-24).map(val => val.value));
        todayMax = Math.max(...answer.slice(-24).map(val => val.value));
    } else {
        todayMin = Math.min(...answer.slice(-48, -24).map(val => val.value));
        todayMax = Math.max(...answer.slice(-48, -24).map(val => val.value));
    }
    //const avgToday = eval(today.join('+')) / today.length
    const sumToday = today.reduce((a, v) => a + v, 0)
    const avgToday = sumToday / today.length
    // Last Week
    const weekMax = Math.max(...answer.slice(-168).map(val => val.value));
    const weekMin = Math.min(...answer.slice(-168).map(val => val.value));
    const avgLastWeek = eval(lastWeek.join('+')) / lastWeek.length
    // Last 31 days
    const monthMax = Math.max(...answer.slice(-744).map(val => val.value));
    const monthMin = Math.min(...answer.slice(-744).map(val => val.value));
    const avgMonth = eval(last31.join('+')) / last31.length

    // Datat charteille

    // Päivän/viikon/kk alin/avg/ylin...
    let dataDay = ''
    if (value === 'Today' || value === null) {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [((100 + alv) / 100 * todayMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgToday).toFixed(2),
                ((100 + alv) / 100 * todayMax * 0.1).toFixed(2)]
            }]
        }
    }
    if (value === 'LastSeven') {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [((100 + alv) / 100 * weekMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgLastWeek * 0.1).toFixed(2),
                ((100 + alv) / 100 * weekMax * 0.1).toFixed(2)]
            }]
        }
    }
    if (value === 'LastMonth') {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [((100 + alv) / 100 * monthMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgMonth * 0.1).toFixed(2),
                ((100 + alv) / 100 * monthMax * 0.1).toFixed(2)]
            }]
        }
    }



    // Charttien kokoonpano
    const chartConfig = {
        backgroundGradientFrom: "#1f2131",
        backgroundGradientFromOpacity: 2,
        backgroundGradientTo: "#1f2131",
        backgroundGradientToOpacity: 1,
        color: (opacity = 1) => `rgba(166, 211, 216, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false, // optional 

    };

    // Notification 
    async function schedulePushNotification() {

        const hasPushNotificationPermissionGranted = await allowsNotificationsAsync()
        //console.log(hasPushNotificationPermissionGranted)
        if (hasPushNotificationPermissionGranted && sum > 30) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Hinta tieto",
                    body: 'Pörssisähkön hinta on nyt kallista.',
                    data: { data: 'goes here' },
                },
                trigger: { seconds: 2 },
            });

        }
        if (hasPushNotificationPermissionGranted && sum < 10) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Hinta tieto",
                    body: 'Pörssisähkön hinta on nyt halpaa.',
                    data: { data: 'goes here' },
                },
                trigger: { seconds: 2 },
            });

        }
    }

    const summa = sum;
    //console.log(summa)
    return (

        <View style={[styles.container]}>

            <View style={styles.home} >
                <ElCarScreen price={summa} />

                <View style={[{ marginBottom: 20, marginTop: 20 }]}>
                    <RadioForm
                        //style={theme.radio}
                        buttonSize={10}
                        buttonOuterSize={20}
                        radio_props={alvData}
                        initial={0}
                        onPress={(value) => { setAlv(value) }}
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
                        placeholder='Tämä päivä'
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        //defaultIndex={0}
                        containerStyle={{ height: 30 }}
                        onChangeItem={item => setValue(item.value)}

                    />
                </View>
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <View  >
                        <Grid >
                            <Col style={{ alignItems: 'center', marginTop: 75 }}>
                                <BarChart
                                    //style={graphStyle}
                                    data={dataDay}
                                    width={responsiveWidth(90)}
                                    height={250}
                                    yAxisSuffix=" snt"
                                    chartConfig={chartConfig}
                                    verticalLabelRotation={16}
                                    fromZero={true}
                                    showValuesOnTopOfBars={true}
                                    showBarTops={false}
                                    bezier
                                    style={{
                                        marginVertical: 8,
                                        borderRadius: 16,
                                        shadowColor: "#a6d3d8",
                                        elevation: 5,
                                    }}
                                />
                            </Col>
                        </Grid>
                    </View>

                    <View style={styles.home}>
                        <Col style={{ alignItems: 'center', marginTop: 50, marginBottom: 30 }}>
                            <Text style={[styles.text, { marginBottom: 20, fontSize: 20 }]}>Hinta nyt</Text>
                            <View style={{
                                width: 175,
                                height: 175,
                                backgroundColor: 'black',
                                borderRadius: 100,
                                //paddingHorizontal: 40,
                                alignSelf: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: "#00FF00",
                                shadowOpacity: 5,
                                elevation: 10,
                                shadowRadius: 50
                            }}>
                                <Text style={styles.text}>{sum} snt/kWh</Text>
                            </View>
                        </Col>
                    </View>

                    <View style={{ marginTop: 30, alignItems: 'center' }}>
                        <Text style={[styles.text, { textAlign: 'center', margin: 20, fontSize: 16 }]}>Hinta tänään</Text>
                        <View>
                            <LineChart
                                data={{
                                    labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                        "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                    datasets: [
                                        { data: today }
                                    ]
                                }}
                                width={responsiveWidth(90)} // from react-native
                                height={200}
                                //yAxisLabel="€"
                                yAxisSuffix="snt"
                                yAxisInterval={1} // optional, defaults to 1
                                fromZero={true}
                                verticalLabelRotation={-40}
                                chartConfig={{
                                    backgroundColor: "#0000",
                                    backgroundGradientFrom: "#1f2131",
                                    backgroundGradientTo: "#1f2131",
                                    decimalPlaces: 2, // optional, defaults to 2dp
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(166, 211, 216, ${opacity})`,
                                    style: {
                                        borderRadius: 16

                                    },
                                    propsForDots: {
                                        r: "2",
                                        strokeWidth: "1",
                                        stroke: "#ffa726"
                                    },
                                    propsForLabels: {
                                        fontSize: 10,

                                    },
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,




                                }}
                            />
                        </View>

                    </View>
                    <View style={{ marginTop: 30, alignItems: 'center' }}>

                        <Text style={[styles.text, { marginBottom: 20, fontSize: 16 }]}>Hinta huomenna (julkaistaan päivittäin kello 14:00)</Text>
                        <LineChart
                            data={{
                                labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                    "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                datasets: [
                                    {
                                        data: tomorrow
                                    }
                                ]
                            }}
                            width={responsiveWidth(90)} // from react-native
                            height={200}
                            //yAxisLabel="€"
                            yAxisSuffix=" snt"
                            yAxisInterval={1} // optional, defaults to 1
                            fromZero={true}
                            verticalLabelRotation={-40}
                            chartConfig={{
                                backgroundColor: "#0000",
                                backgroundGradientFrom: "#1f2131",
                                backgroundGradientTo: "#1f2131",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(166, 211, 216, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "2",
                                    strokeWidth: "1",
                                    stroke: "#ffa726"
                                },
                                propsForLabels: {
                                    fontSize: 10,

                                },
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}

                        />

                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

export { PricesScreen };