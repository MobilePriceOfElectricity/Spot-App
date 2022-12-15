import {View} from "react-native";
import {ProductionCfTemp} from "./ProductionCfTemp";
import {ElectricityProduction} from "./ElectricityProduction";
import {InlandCfImport} from './InlandCfImport';
import styles from "../styles/styles";
import { ScrollView } from "react-native-gesture-handler";

export function DataScreen() {
  return(
    <View style={styles.container}>
      <View style={styles.home}>
        <ScrollView>
        <ProductionCfTemp/>
        <ElectricityProduction/>
        <InlandCfImport/>
        </ScrollView>
      </View>
    </View>
  ) 
}

