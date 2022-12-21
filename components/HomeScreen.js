import React from 'react';
import "react-native-gesture-handler";
import { Text, Button, View, ScrollView, RefreshControl } from 'react-native';
import { LineChart } from "react-native-chart-kit";
import { Col, Grid } from 'react-native-easy-grid'
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker'
import RadioForm from 'react-native-simple-radio-button';
import { responsiveWidth } from "react-native-responsive-dimensions";
import { useState, useEffect, useRef } from 'react';
import { LoadingIcon } from './LoadingIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';

//Asyncstorage
const STORAGE_KEY = "@Down_Key";
const STORAGE_KEY2 = "@Up_Key";

//Refresh control
const wait = (timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

const HomeScreen = () => {
    const [isLoaded, setIsLoaded] = useState();
    //Data
    const [today, setToday] = useState([])
    const [nextDay, setNextDay] = useState([])
    const [week, setWeek] = useState([])
    const [month, setMonth] = useState([])
    //Alv
    const [hour, setHour] = useState();
    const [time, setTime] = useState()
    const [alv, setAlv] = useState(24);
    //dropdown
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Tämä päivä', value: 'Today' },
        { label: 'Edelliset 7 vrk', value: 'LastSeven' },
        { label: 'Edelliset 31 vrk', value: 'LastMonth' },
    ]);

    const [titleText, setTitleText] = useState('Tämä päivä');

    //Refresh Control
    const [refreshing, setRefreshing] = React.useState(false);

    //Asyncstorage
    const [downLimit, setDownLimit] = useState('')
    const [upLimit, setUpLimit] = useState('')

    useEffect(() => {
        fetchToday()
        fetchNextDay()
        fetchWeekAndMonth()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
        let minute = new Date().getMinutes()
        let hours = new Date().getHours()
        setTime([hours, minute].join(":"))
        getValueFunction()
        getUpValueFunction()
    }, [])

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
                setNextDay(res[0]['24h'])
            })
        setIsLoaded(true)
    }

    const fetchWeekAndMonth = () => {
        fetch('http://www.students.oamk.fi/~n0juro00/MobiiliProjekti/Get31-7-day-data.php', {
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
                setMonth([])
                setWeek([])
                setWeek(Object.values(res[0]['SeisamanPaivanData']))
                setMonth(Object.values(res[0]['31PaivanData']))
            })
        setIsLoaded(true)
    }

    //Get current price
    let priceNow = ''
    for (let i = 0; i < today.length; i++)
        if (hour === today[i].time) {
            priceNow = ((100 + alv) / 100 * today[i].price).toFixed(2)
        }


    //Alv arvot
    const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 0 }];

    // Change data if time is 14:15
    let todayChart = [];
    let tomorrowChart = [];
    if (time < '14:15') {
        todayChart = today.map(val => ((100 + alv) / 100 * val.price).toFixed(2)).splice(0, 23);
        tomorrowChart = new Array(23).fill(0);
    } else {
        todayChart = today.map(val => ((100 + alv) / 100 * val.price).toFixed(2)).splice(0, 23);
        tomorrowChart = nextDay.map(val => ((100 + alv) / 100 * val.price).toFixed(2));
    }

    // Data to dropdown chart
    let newWeek = []
    for (let i = 0; i < week.length; i++) {
        newWeek.push(((100 + alv) / 100 * week[i]).toFixed(2))
    }

    let newMonth = []
    for (let i = 0; i < month.length; i++) {
        newMonth.push(((100 + alv) / 100 * month[i]).toFixed(2))
    }

    // Chart config
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

    let min = ''
    let awg = ''
    let max = ''
    if (value === 'Today' || value === null) {
        min = today.map(val => val.min).slice(26, 27);
        awg = today.map(val => val.avg).slice(25, 26);
        max = today.map(val => val.max).slice(27);
    }
    if (value === 'LastSeven') {
        min = newWeek.map(val => val).slice(1, 2);
        awg = newWeek.map(val => val).slice(0, 1);
        max = newWeek.map(val => val).slice(2);
    }

    if (value === 'LastMonth') {
        min = newMonth.map(val => val).slice(1, 2);
        awg = newMonth.map(val => val).slice(0, 1);
        max = newMonth.map(val => val).slice(2);
    }

     //console.log(max)
    //Refresh Control
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
        fetchToday()
        fetchNextDay()
        fetchWeekAndMonth()
        getValueFunction()
        getUpValueFunction()
    }, []);

    // Get pricelimit
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

    // Scroll top when dropdown items change
    const scrollRef = useRef();

    const onPressTouch = () => {
        scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
        });
    }

    if (!isLoaded) {
        return (<LoadingIcon />)
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.home}>
                    <ScrollView ref={scrollRef} style={[{ marginBottom: 20, marginTop: 20 }]}
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
                            <View style={styles.home}>
                            <Col style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                                <Text style={[styles.text, { marginBottom: 20, fontSize: 20 }]}>Hinta nyt</Text>
                                <View style={[
                                    priceNow <= downLimit ? styles.low : styles.itemprice,
                                    priceNow > downLimit && priceNow < upLimit ? styles.middle : styles.itemprice,
                                    priceNow >= upLimit ? styles.high : styles.itemprice, styles.itemprice]}>
                                    <Text style={[styles.text, {fontSize: 30}]}>{(priceNow * 1).toFixed(2)} snt</Text>
                                </View>
                            </Col>
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
                            <View style={[{ marginBottom: 20, marginTop: 20, flexDirection: 'row' }]}>
                                <Button title="Tämä päivä" onPress={() => [setValue('Today'), setTitleText('Tämä päivä')]} ></Button>
                                <Button title="Edelliset 7 vrk" onPress={() => [setValue('LastSeven'), setTitleText('Edelliset 7 vrk')]}></Button>
                                <Button title="Edelliset 31 vrk" onPress={() => [setValue('LastMonth'), setTitleText('Edelliset 31 vrk')]}></Button>
                            </View>
                            <Text>{titleText}</Text>
                        </View>
                        <View>
                            <Grid>
                                <Col style={{ alignItems: 'center', marginTop: 10 }}>
                                    <Col style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                                        <View style={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: '#1f2131',
                                            borderWidth: 1,
                                            borderRadius: 30,
                                            borderColor: 'rgba(00, 255, 00, 0.15)',
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: "green",
                                            //shadowOpacity: 5,
                                            elevation: 10,
                                            shadowRadius: 50
                                        }}>
                                            <Text style={[styles.text, {fontSize:20}]}>{(min * 1).toFixed(2)} snt</Text>
                                        </View>
                                        <Text style={[styles.text, { marginTop: 10, fontSize: 20 }]}>Min</Text>
                                    </Col>
                                </Col>
                                <Col style={{ alignItems: 'center', marginTop: 10 }}>
                                    <Col style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                                        <View style={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: '#1f2131',
                                            borderRadius: 30,
                                            borderWidth: 1,
                                            borderColor: 'rgba(255, 165, 00, 0.15)',
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: "orange",
                                            //shadowOpacity: 5,
                                            elevation: 10,
                                            shadowRadius: 50
                                        }}>
                                            <Text style={[styles.text, {fontSize:20}]}>{(awg * 1).toFixed(2)} snt</Text>
                                        </View>
                                        <Text style={[styles.text, { marginTop: 10, fontSize: 20 }]}>Avg</Text>
                                    </Col>
                                </Col>
                                <Col style={{ alignItems: 'center', marginTop: 10 }}>
                                    <Col style={{ alignItems: 'center', marginTop: 10, marginBottom: 30 }}>
                                        <View style={{
                                            width: 100,
                                            height: 100,
                                            backgroundColor: '#1f2131',
                                            borderRadius: 30,
                                            borderWidth:1,
                                            borderColor: 'rgba(255, 00, 00, 0.15)',
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            shadowColor: "red",
                                            //shadowOpacity: 5,
                                            elevation: 10,
                                            shadowRadius: 50
                                        }}>
                                            <Text style={[styles.text, {fontSize:20}]}>{(max * 1).toFixed(2)} snt</Text>
                                        </View>
                                        <Text style={[styles.text, { marginTop: 10, fontSize: 20 }]}>Max</Text>
                                    </Col>
                                </Col>
                            </Grid>
                        </View>

                        <View style={{ marginTop: 0, alignItems: 'center' }}>
                            <Text style={[styles.text, { textAlign: 'center', margin: 10, fontSize: 16 }]}>Hinta tänään</Text>
                            <View>
                                <LineChart
                                    data={{
                                        labels: ["02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
                                        datasets: [
                                            {
                                                data: todayChart
                                            },
                                            {
                                                data: [0], withDots: false
                                            }
                                        ]
                                    }}
                                    width={responsiveWidth(90)} // from react-native
                                    height={200}
                                    //yAxisLabel="€"
                                    yAxisSuffix="snt"
                                    yAxisInterval={1} // optional, defaults to 1
                                    //fromZero={true}
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
                        <View style={{ marginTop: 10, alignItems: 'center' }}>

                            <Text style={[styles.text, { marginBottom: 20, fontSize: 16 }]}>Hinta huomenna (julkaistaan päivittäin kello 14:00)</Text>
                            <LineChart
                                data={{
                                    labels: ["02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
                                    datasets: [
                                        {
                                            data: tomorrowChart
                                        },
                                        {
                                            data: [0], withDots: false
                                        }
                                    ]
                                }}
                                width={responsiveWidth(90)} // from react-native
                                height={200}
                                //yAxisLabel="€"
                                yAxisSuffix=" snt"
                                yAxisInterval={1} // optional, defaults to 1
                                //fromZero={true}
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
}
export { HomeScreen }
