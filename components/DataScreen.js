import {View} from "react-native";
import {ProductionCfTemp} from "./ProductionCfTemp";
import {ElectricityProduction} from "./ElectricityProduction";
import {InlandCfImport} from './InlandCfImport';
import styles from "../styles/styles";

export function DataScreen() {
  return(
    <View style={styles.container}>
      <View style={styles.home}>
        <ProductionCfTemp/>
        <ElectricityProduction/>
        <InlandCfImport/>
      </View>
    </View>
  ) 
}

