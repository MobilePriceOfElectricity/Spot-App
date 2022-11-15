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
import styles from '../styles/styles';

const URL = 'https://web-api.tp.entsoe.eu/api?'
const TOKEN = 'securityToken=419b446b-122c-414f-8586-fc7d6ff39def'
const DOCTYPE = '&documentType=A44'
const OUT_BIDD_ZONE = '&outBiddingZone_Domain=10YFI-1--------U'
const IN_DOM = '&in_Domain=10YFI-1--------U'
const OUT_DOM = '&out_Domain=10YFI-1--------U'

const PricesScreen = () => {
    const [answer, setAnswer] = useState();
    //const [lastSevenDays, setLastSevenDays] = useState('');
    //const [lastMonth, setLastMonth] = useState('');
    //const [dayAhead, setDayAhead] = useState('');
    const [hour, setHour] = useState();
    const [test, setTest] = useState();

    useEffect(() => {
        let interval = setInterval(() => {
        // Get date, the previous seven days and the previous 31 days
        let curDate = moment().utcOffset('+02:00').format('YYYYMMDDHH00');
        let dayAhead = moment().add(1, 'd').format('YYYYMMDDHH00')
        //setDayAhead(dayAhead);
        //let lastSeven = moment().subtract(7, 'd').format('YYYYMMDDHH00')
        //setLastSevenDays(lastSeven)
        let lastMonth = moment().subtract(31, 'd').format('YYYYMMDDHH00')
        //setLastMonth(lastMonth)
        setHour(curDate.substring(8, 10))

        fetch(URL + TOKEN + DOCTYPE + OUT_BIDD_ZONE + '&periodStart=' + lastMonth + '&periodEnd=' + dayAhead + IN_DOM + OUT_DOM)
            .then(resp => resp.text())
            .then(data => {
                let XMLParser = require('react-xml-parser');
                const xml = new XMLParser().parseFromString(data);
                setAnswer(xml.getElementsByTagName('Price'))
                setTest(xml.getElementsByTagName('Period'))
                //console.log(test)
            })
            .catch(e => console.log(e))

        }, 10000);

        return () => {
            clearInterval(interval)
        }

    }, [])


    if (!answer) {
        return null;
    }
    if (!test) {
        return null;
    }

    const today = answer.slice(-48, -24).map(val => val.value);
    const today1 = answer.slice(-48, -24).map(val => ((100 + 24) / 100 * val.value * 0.1));
    const lastWeek = answer.slice(-168).map(val => val.value);
    const last31 = answer.slice(-744).map(val => val.value);
    const tomorrow = answer.slice(-24).map(val => ((100 + 24) / 100 * val.value * 0.1));

    //console.log(answer)
    //console.log(today)

    // Testiä...
/*     const testi = test.map(period => period.children);

    const point = testi[1].map((point) => point.children.map(({ name, value }) => ({ [name]: value })))

    console.log(testi)
    console.log(point)

    let newData = []
    for (let i = 2; i < point.length; i++) {

        point[i].map((item) => newData.push({ price: item.price, time: item.position }));
    }
    console.log(newData)
 */
    let sum = ''
    //for (let i = 0; i < today.length; i++)
    if (hour === '01') {
        sum = today[0]
    } if (hour === '02') {
        sum = today[1]
    } if (hour === '03') {
        sum = today[2]
    } if (hour === '04') {
        sum = today[3]
    } if (hour === '05') {
        sum = today[4]
    } if (hour === '06') {
        sum = today[5]
    } if (hour === '07') {
        sum = today[6]
    } if (hour === '08') {
        sum = today[7]
    } if (hour === '09') {
        sum = today[8]
    } if (hour === '10') {
        sum = today[9]
    } if (hour === '11') {
        sum = today[10]
    } if (hour === '12') {
        sum = today[11]
    } if (hour === '13') {
        sum = today[12]
    } if (hour === '14') {
        sum = today[13]
    } if (hour === '15') {
        sum = today[14]
    } if (hour === '16') {
        sum = today[15]
    } if (hour === '17') {
        sum = today[16]
    } if (hour === '18') {
        sum = today[17]
    } if (hour === '19') {
        sum = today[18]
    } if (hour === '20') {
        sum = today[19]
    } if (hour === '21') {
        sum = today[20]
    } if (hour === '22') {
        sum = today[21]
    } if (hour === '23') {
        sum = today[22]
    } if (hour === '24') {
        sum = today[23]
    } if (hour === '00') {
        sum = today[24]
    }

    // Today
    const todayMax = Math.max(...answer.slice(-48, -24).map(val => val.value));
    const todayMin = Math.min(...answer.slice(-48, -24).map(val => val.value));
    const avgToday = eval(today.join('+')) / today.length
    // Last Week
    const weekMax = Math.max(...answer.slice(-168).map(val => val.value));
    const weekMin = Math.min(...answer.slice(-168).map(val => val.value));
    const avgLastWeek = eval(lastWeek.join('+')) / lastWeek.length
    // Last 31 days
    const monthMax = Math.max(...answer.slice(-744).map(val => val.value));
    const monthMin = Math.min(...answer.slice(-744).map(val => val.value));
    const avgMonth = eval(last31.join('+')) / last31.length

/*     console.log(todayMax)
    console.log(todayMin)
    console.log(dayAhead)
    console.log(hour)
    console.log(lastSevenDays)
    console.log(lastMonth)
    console.log(weekMin)
    console.log(avgToday) */

    // Datat charteille

    // Päivän alin/avg/ylin...
    const dataDay = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            { data: [((100 + 24) / 100 * todayMin * 0.1).toFixed(2),
                    ((100 + 24) / 100 * avgToday * 0.1).toFixed(2),
                    ((100 + 24) / 100 * todayMax * 0.1).toFixed(2)]}
        ]
    };

    //Viikon alin/avg/ylin...
    const dataWeek = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            { data: [((100 + 24) / 100 * weekMin * 0.1).toFixed(2),
                    ((100 + 24) / 100 * avgLastWeek * 0.1).toFixed(2),
                    ((100 + 24) / 100 * weekMax * 0.1).toFixed(2)]}
        ]
    };
    // Tämä hetki...
    const dataNow = {
        labels: ["Hinta nyt"], // optional
        datasets: [
            {data: [((100 + 24) / 100 * sum * 0.1).toFixed(2)]}
    ]
};

    // 31 päivän alin/avg/ylin...
    const dataMonth = {
        labels: ["Alin", "Avg", "Ylin"],
        datasets: [
            { data: [((100 + 24) / 100 * monthMin * 0.1).toFixed(2),
                    ((100 + 24) / 100 * avgMonth * 0.1).toFixed(2),
                    ((100 + 24) / 100 * monthMax * 0.1).toFixed(2)]}
        ]
    };

    // Charttien kokoonpano
    const chartConfig = {
        backgroundGradientFrom: "#1E2923",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#08130D",
        backgroundGradientToOpacity: 0.5,
        color: (opacity = 1) => `rgba(16, 16, 16, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        barPercentage: 0.5,
        useShadowColorFromDataset: false // optional
    };


    return (
        <View style={styles.container}>
            <ScrollView>
                <View width={Dimensions.get("window").width} >
                    <Grid >
                        <Col>
                            <Text>Viime kuukauden ylin/alin</Text>
                            <BarChart
                                //style={graphStyle}
                                data={dataMonth}
                                width={120}
                                height={100}
                                yAxisSuffix=" snt"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                showBarTops={false}
                            />
                            <Text style={styles.text}>Ylin: {((100 + 24) / 100 * monthMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>keskihinta: {((100 + 24) / 100 * avgMonth * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + 24) / 100 * monthMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                        <Col>
                            <Text>Viime viikon ylin/alin</Text>
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
                            <Text style={styles.text}>Ylin: {((100 + 24) / 100 * weekMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>keskihinta: {((100 + 24) / 100 * avgLastWeek * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + 24) / 100 * weekMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                        <Col>
                            <Text>Tämä päivä ylin/alin</Text>
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
                            <Text style={styles.text}>Ylin: {((100 + 24) / 100 * todayMax * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>keskihinta: {((100 + 24) / 100 * avgToday * 0.1).toFixed(2)} snt/kWh</Text>
                            <Text style={styles.text}>Alin: {((100 + 24) / 100 * todayMin * 0.1).toFixed(2)} snt/kWh</Text>
                        </Col>
                    </Grid>
                </View>
                <View width={Dimensions.get("window").width}>
                    <Col style={{alignItems: 'center'}}>
                        <Text>Hinta nyt</Text>
                        <BarChart
                                //style={graphStyle}
                                data={dataNow}
                                width={350}
                                height={300}
                                yAxisSuffix=" snt"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                showBarTops={false}
                            />
                        <Text style={styles.text}>{((100 + 24) / 100 * sum * 0.1).toFixed(2)} snt/kWh</Text>
                    </Col>
                </View>
                <View width={Dimensions.get("window").width}>
                    <Col>
                        <Text>Hinta tänään</Text>
                        <LineChart
                            data={{
                                labels: ["01:00", "03:00", "05:00", "07:00", "10:00",
                                    "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
                                datasets: [
                                    { data: today1 }
                                ]
                            }}
                            width={Dimensions.get("window").width} // from react-native
                            height={220}
                            //yAxisLabel="€"
                            yAxisSuffix="snt"
                            yAxisInterval={1} // optional, defaults to 1
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
                        <Text>Hinta huomenna julkaistaan päivittäin kello 14:00</Text>
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