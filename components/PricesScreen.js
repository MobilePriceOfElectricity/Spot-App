import { Text, View, Dimensions, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
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
import RadioForm from 'react-native-simple-radio-button';
import styles from '../styles/styles';

const URL = 'https://web-api.tp.entsoe.eu/api?'
const TOKEN = 'securityToken=419b446b-122c-414f-8586-fc7d6ff39def'
const DOCTYPE = '&documentType=A44'
const OUT_BIDD_ZONE = '&outBiddingZone_Domain=10YFI-1--------U'
const IN_DOM = '&in_Domain=10YFI-1--------U'
const OUT_DOM = '&out_Domain=10YFI-1--------U'

const PricesScreen = () => {
    const [answer, setAnswer] = useState();
    const [hour, setHour] = useState();
    const [allData, setAllData] = useState();
    const [alv, setAlv] = useState(24);

    useEffect(() => {
        //let interval = setInterval(() => {
        // Get date, the previous seven days and the previous 31 days
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        let dayAhead = moment().add(1, 'd').format('YYYYMMDDHH00')
        let lastMonth = moment().subtract(31, 'd').format('YYYYMMDDHH00')
        setHour(curDate.substring(8, 10))

        fetch(URL + TOKEN + DOCTYPE + OUT_BIDD_ZONE + '&periodStart=' + lastMonth + '&periodEnd=' + dayAhead + IN_DOM + OUT_DOM)
            .then(resp => resp.text())
            .then(data => {
                let XMLParser = require('react-xml-parser');
                const xml = new XMLParser().parseFromString(data);
                setAnswer(xml.getElementsByTagName('Price'))
                setAllData(xml.getElementsByTagName('Period'))
            })
            .catch(e => console.log(e))
        /* 
                }, 50000);
        
                return () => {
                    clearInterval(interval)
                }
         */
    }, [])


    if (!answer) {
        return null;
    }
    if (!allData) {
        return null;
    }

    // Alv arvot
    const alvData = [
        { label: 'Alv 24%', value: 24},
        { label: 'Alv 10%', value: 10 },
        { label: 'Alv 0%', value: 1 }];


    // Hakee ajan mukaan dataa eri kohdasta
    let today = '';
    if (hour < '14' && hour > '00') {
        today = answer.slice(-24).map(val => ((100 + alv) / 100 * val.value * 0.1));
    } else {
        today = answer.slice(-48, -24).map(val => ((100 + alv) / 100 * val.value * 0.1));
    // Hakee ennusteen ajan mukaan
    }
    let tomorrow = ''
    if (hour < '14') {
        tomorrow = new Array(24).fill(0);
    } else {
        tomorrow = answer.slice(-24).map(val => ((100 + alv) / 100 * val.value * 0.1));
    }

    const lastWeek = answer.slice(-168).map(val => val.value);
    const last31 = answer.slice(-744).map(val => val.value);

    // Tämän hetkinen hinta
    const period = allData.map(period => period.children);
    //console.log(period)
    
    let point = ''
    if (hour > '14' && hour < '22') {
        point = period[32].map((point) => point.children.map(({ name, value }) => ({ [name]: value })))
    } else {
        point = period[31].map((point) => point.children.map(({ name, value }) => ({ [name]: value })))
    }
    
    //console.log(point)

    let newData = []
    for (let i = 2; i < point.length; i++) {
        const item = point[i]
        const position = ('0' + item[0].position).slice(-2)
        const price = item[1].price
        newData.push({ price: price, time: position });
    }

    let sum = ''
    for (let i = 0; i < newData.length; i++)
        if (hour === newData[i].time) {
            sum = newData[i].price
        } else if (hour === '00') {
            sum = newData[i].price
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
    const avgToday = eval(today.join('+')) / today.length
    // Last Week
    const weekMax = Math.max(...answer.slice(-168).map(val => val.value));
    const weekMin = Math.min(...answer.slice(-168).map(val => val.value));
    const avgLastWeek = eval(lastWeek.join('+')) / lastWeek.length
    // Last 31 days
    const monthMax = Math.max(...answer.slice(-744).map(val => val.value));
    const monthMin = Math.min(...answer.slice(-744).map(val => val.value));
    const avgMonth = eval(last31.join('+')) / last31.length

    // Datat charteille

    // Päivän alin/avg/ylin...
    const dataDay = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            {
                data: [((100 + alv) / 100 * todayMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgToday).toFixed(2),
                ((100 + alv) / 100 * todayMax * 0.1).toFixed(2)]
            },
        ]
    };

    // Viikon alin/avg/ylin...
    const dataWeek = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            {
                data: [((100 + alv) / 100 * weekMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgLastWeek * 0.1).toFixed(2),
                ((100 + alv) / 100 * weekMax * 0.1).toFixed(2)]
            }
        ]
    };
    // Tämä hetki...
    const dataNow = {
        labels: ["Hinta nyt"], // optional
        datasets: [
            { data: [((100 + alv) / 100 * sum * 0.1).toFixed(2)] }
        ]
    };

    // 31 päivän alin/avg/ylin...
    const dataMonth = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            {
                data: [((100 + alv) / 100 * monthMin * 0.1).toFixed(2),
                ((100 + alv) / 100 * avgMonth * 0.1).toFixed(2),
                ((100 + alv) / 100 * monthMax * 0.1).toFixed(2)]
            }
        ]
    };

    // Charttien kokoonpano
    const chartConfig = {
        backgroundGradientFrom: "#a6d3d8",
        backgroundGradientFromOpacity: 1,
        backgroundGradientTo: "#a6d3d8",
        backgroundGradientToOpacity: 1,
        color: (opacity = 1) => `rgba(16, 16, 16, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };

    return (
        <View style={styles.home}>
            <ScrollView>
                <View>
                    <RadioForm
                        //style={theme.radio}
                        buttonSize={10}
                        radio_props={alvData}
                        initial={0}
                        onPress={(value) => { setAlv(value) }}
                        buttonColor={'#a6d3d8'}
                        selectedButtonColor={'#b64600'}
                        labelColor={'#a6d3d8'}
                        selectedLabelColor={'#a6d3d8'}
                        
                    />
                </View>
                <View width={Dimensions.get("window").width} >
                    <Grid >
                        <Col>
                            <Text style={styles.text}>Edelliset 31 vrk:</Text>
                            <BarChart
                                //style={graphStyle}
                                data={dataMonth}
                                width={120}
                                height={100}
                                //maxValue={100}
                                yAxisSuffix=" snt"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                //fromNumber={100}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                showBarTops={false}
                            />
                            <Text style={styles.text}>Ylin: {((100 + alv) / 100 * monthMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Avg: {((100 + alv) / 100 * avgMonth * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + alv) / 100 * monthMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                        <Col>
                            <Text style={styles.text}>Edelliset 7 vrk:</Text>
                            <BarChart
                                //style={graphStyle}
                                data={dataWeek}
                                width={120}
                                height={100}
                                yAxisSuffix=" snt"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                showBarTops={false}
                            />
                            <Text style={styles.text}>Ylin: {((100 + alv) / 100 * weekMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Avg: {((100 + alv) / 100 * avgLastWeek * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + alv) / 100 * weekMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                        <Col>
                            <Text style={styles.text}>Tämä päivä: </Text>
                            <BarChart
                                //style={graphStyle}
                                data={dataDay}
                                width={120}
                                height={100}
                                yAxisSuffix=" snt"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                showBarTops={false}
                            />
                            <Text style={styles.text}>Ylin: {((100 + alv) / 100 * todayMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Avg: {((100 + alv) / 100 * avgToday).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + alv) / 100 * todayMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                    </Grid>
                </View>
                <View width={Dimensions.get("window").width}>
                    <Col style={{ alignItems: 'center' }}>
                        <Text style={styles.text}>Hinta nyt</Text>
                        <BarChart
                            //style={graphStyle}
                            data={dataNow}
                            width={300}
                            height={300}
                            yAxisSuffix=" snt"
                            chartConfig={chartConfig}
                            verticalLabelRotation={30}
                            fromZero={true}
                            showValuesOnTopOfBars={true}
                            showBarTops={false}
                        />
                        <Text style={styles.text}>{((100 + alv) / 100 * sum * 0.1).toFixed(2)} snt/kWh</Text>
                    </Col>
                </View>
                <View width={Dimensions.get("window").width}>
                    <Col>
                        <Text style={styles.text}>Hinta tänään</Text>
                        <LineChart
                            data={{
                                labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                    "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                datasets: [
                                    { data: today }
                                ]
                            }}
                            width={Dimensions.get("window").width} // from react-native
                            height={220}
                            //yAxisLabel="€"
                            yAxisSuffix="snt"
                            yAxisInterval={1} // optional, defaults to 1
                            fromZero={true}
                            chartConfig={{
                                backgroundColor: "#000000",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "1",
                                    stroke: "#ffa726"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </Col>
                </View>
                <View width={Dimensions.get("window").width}>
                    <Col>
                        <Text style={styles.text}>Hinta huomenna (julkaistaan päivittäin kello 14:00)</Text>
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
                            width={Dimensions.get("window").width} // from react-native
                            height={220}
                            //yAxisLabel="€"
                            yAxisSuffix="snt"
                            yAxisInterval={1} // optional, defaults to 1
                            fromZero={true}
                            chartConfig={{
                                backgroundColor: "#000000",
                                backgroundGradientFrom: "#fb8c00",
                                backgroundGradientTo: "#ffa726",
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "5",
                                    strokeWidth: "1",
                                    stroke: "#ffa726"
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </Col>
                </View>
            </ScrollView>
        </View>
    );
}

export { PricesScreen };