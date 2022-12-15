//import { useNavigation, useRoute } from "@react-navigation/native";
import "react-native-gesture-handler";
import { Animated, Text, View, Dimensions, ScrollView, RefreshControl, FlatList, SafeAreaView } from 'react-native';
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
import DropDownPicker from 'react-native-dropdown-picker'
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { responsiveWidth } from "react-native-responsive-dimensions";
import { useState, useEffect, useLayoutEffect } from 'react';
import { LoadingIcon } from './LoadingIcon';
import styles from '../styles/styles';

const HomeScreen = ({navigation}) => {
    const [isLoaded, setIsLoaded] = useState();
    // Data
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
                setWeek(res['7vk'])
                setMonth(res['1kk'])
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

    /*
    const fetchWeek = () => {
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
                console.log(res[0]['24h'])
                setNextDay(res[0]['24h'])
            })
        setIsLoaded(true)
    }

    const fetchMonth = () => {
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
                console.log(res[0]['24h'])
                setNextDay(res[0]['24h'])
            })
        setIsLoaded(true)
    }
*/
    useEffect(() => {
        fetchToday()
        fetchNextDay()
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        setHour(curDate.substring(8, 10))
        //sendPrice();

    }, [])

    //Tarkista kello
    let priceNow = ''
    for (let i = 0; i < today.length; i++)
        if (hour === today[i].time) {
            priceNow = ((100 + alv) / 100 * today[i].price).toFixed(2)
        }

    // Alv arvot
    const alvData = [
        { label: 'Alv 24%', value: 24 },
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 0 }];

    let dataDay = ''
    if (value === 'Today' || value === null) {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [priceNow, priceNow, priceNow]
            }]
        }
    }
    if (value === 'LastSeven') {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [priceNow, priceNow, priceNow]
            }]
        }
    }
    if (value === 'LastMonth') {
        dataDay = {
            labels: ["ALIN", "AVG", "YLIN"],
            datasets: [{
                data: [priceNow, priceNow, priceNow]
            }]
        }
    }

        // Hakee ajan mukaan dataa eri kohdasta
        let todayChart = '';
        let tomorrowChart = '';
        if (hour < '14') {
            todayChart = today.map(val => parseInt(((100 + alv) / 100 * val.price).toFixed(2)));
            tomorrowChart = new Array(23).fill(0);
        } else {
            todayChart = today.map(val => parseInt(((100 + alv) / 100 * val.price).toFixed(2)));
            tomorrowChart = nextDay.map(val => parseInt(((100 + alv) / 100 * val.price).toFixed(2)));
        }

        //console.log(todayChart)
        //console.log(tomorrowChart)
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
        
        // Send price data
        //const navigation = useNavigation();

        // const sendPrice = () => {
        //     navigation.navigate("Sähköauto",{hinta: 10, id: 1})
        // }

    //console.log(hinta)
    //console.log(month)



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
                    <ScrollView>
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
                                        marginHorizontal: 10
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
                        <View style={{  marginTop: 30, alignItems: 'center'}}>
                            <Text style={[styles.text, {textAlign: 'center', margin: 20, fontSize: 16 }]}>Hinta tänään</Text>
                            <View>
                                <LineChart
                                        data={{
                                            labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                                "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                            datasets: [
                                                { data: [0,9,7,5,8] }]
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
                                    labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                        "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                    datasets: [
                                        { data: [0,3,5,67] /*tomorrowChart*/ }
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