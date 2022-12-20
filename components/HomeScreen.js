//import { useNavigation, useRoute } from "@react-navigation/native";
import React from 'react';
import "react-native-gesture-handler";
import { Text, View, ScrollView, RefreshControl } from 'react-native';
import { LineChart, BarChart } from "react-native-chart-kit";
import { Col, Grid } from 'react-native-easy-grid'
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { responsiveWidth } from "react-native-responsive-dimensions";
import { useState, useEffect, useLayoutEffect } from 'react';
import { LoadingIcon } from './LoadingIcon';
import styles from '../styles/styles';

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
    const [alv, setAlv] = useState(24);
    //dropdown
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        { label: 'Tämä päivä', value: 'Today' },
        { label: 'Edelliset 7 vrk', value: 'LastSeven' },
        { label: 'Edelliset 31 vrk', value: 'LastMonth' },
    ]);
    //Refresh Control
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        fetchToday()
        fetchNextDay()
        fetchWeekAndMonth()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
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

    useEffect(() => {
        fetchToday()
        fetchNextDay()
        fetchWeekAndMonth()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
    }, [])

    //Tarkista kello
    let priceNow = ''
    for (let i = 0; i < today.length; i++)
        if (hour === today[i].time) {
            priceNow = ((100 + alv) / 100 * today[i].price).toFixed(2)
        }

    

    let todayAwg = today.map(val => ((100 + alv) / 100 * val.avg).toFixed(2)).slice(25,26);
    let todayMin = today.map(val => ((100 + alv) / 100 * val.min).toFixed(2)).slice(26,27);
    let todayMax = today.map(val => ((100 + alv) / 100 * val.max).toFixed(2)).slice(27);

    //Alv arvot
    const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 0 }];

        // Hakee ajan mukaan dataa eri kohdasta
        let todayChart = [];
        let tomorrowChart = [];
        if (hour < '14') {
            todayChart = today.map(val => ((100 + alv) / 100 * val.price).toFixed(2)).splice(0, 23);
            tomorrowChart = new Array(23).fill(0);
        } else {
            todayChart = today.map(val => ((100 + alv) / 100 * val.price).toFixed(2)).splice(0, 23);
            tomorrowChart = nextDay.map(val => ((100 + alv) / 100 * val.price).toFixed(2));
        }

    // Dropdown charteille datat
    let newWeek = []
    for (let i = 0; i < week.length; i++) {
        newWeek.push(((100 + alv) / 100 * week[i]).toFixed(2))
    }

    let newMonth = []
    for (let i = 0; i < month.length; i++) {
        newMonth.push(((100 + alv) / 100 * month[i]).toFixed(2))
    }

    let dataDay = ''
    if (value === 'Today' || value === null) {
        dataDay = {
            labels: ["MIN", "AVG", "MAX"],
            datasets: [{
                data: [todayMin,todayAwg, todayMax]
            }]
        }
    }
    if (value === 'LastSeven') {
        dataDay = {
            labels: ["MIN", "AVG", "MAX"],
            datasets: [{
                data: newWeek.sort((a, b) => a - b)
            }]
        }
    }
    if (value === 'LastMonth') {
        dataDay = {
            labels: ["MIN", "AVG", "MAX"],
            datasets: [{
                data: newMonth.sort((a, b) => a - b)
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

    //Refresh Control
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
        fetchToday()
        fetchNextDay()
        fetchWeekAndMonth()
    }, []);

    // Send price data
    //const navigation = useNavigation();

    // const sendPrice = () => {
    // navigation.navigate("Sähköauto",{data: priceNow})
    // }


    //console.log(todayChart)
    //console.log(tomorrowChart)

    if (!isLoaded) {
        return (<LoadingIcon />)
    } else {
        return (
            <View style={styles.container}>
                <View style={styles.home}>
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
                    <View style={{marginHorizontal: 8}}>
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
                        <View  >
                            <Grid >
                                <Col style={{ alignItems: 'center', marginTop: 75 }}>
                                    <BarChart
                                        //style={graphStyle}
                                        data={dataDay}
                                        width={responsiveWidth(90)}
                                        height={250}
                                        yAxisSuffix=" snt"
                                        yLabelsOffset={5}
                                        //xLabelsOffset={-26}
                                        chartConfig={chartConfig}
                                    
                                        verticalLabelRotation={16}
                                        fromZero={true}
                                        showValuesOnTopOfBars={true}
                                        showBarTops={false}
                                        marginTop={10}
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
                                    //shadowOpacity: 5,
                                    elevation: 10,
                                    shadowRadius: 50
                                }}>
                                    <Text style={styles.text}>{priceNow} snt/kWh</Text>
                                </View>
                            </Col>
                        </View>
                        <View style={{ marginTop: 30, alignItems: 'center' }}>
                            <Text style={[styles.text, { textAlign: 'center', margin: 20, fontSize: 16 }]}>Hinta tänään</Text>
                            <View>
                                <LineChart
                                    data={{
                                        labels: ["02:00", "04:00", "06:00", "08:00", "10:00","12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
                                        datasets: [
                                            { data:  todayChart
                                            }, 
                                            {
                                              data :  [0], withDots: false
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
                        <View style={{ marginTop: 30, alignItems: 'center' }}>

                            <Text style={[styles.text, { marginBottom: 20, fontSize: 16 }]}>Hinta huomenna (julkaistaan päivittäin kello 14:00)</Text>
                            <LineChart
                                data={{
                                    labels: ["02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00"],
                                    datasets: [
                                        { data: tomorrowChart
                                    }, 
                                    {
                                      data :  [0], withDots: false
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