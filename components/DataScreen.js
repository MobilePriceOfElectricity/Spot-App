import {View} from "react-native";
import {ProductionCfTemp} from "./ProductionCfTemp";
import {ElectricityProduction} from "./ElectricityProduction";
import {InlandCfImport} from './InlandCfImport';

export function DataScreen() {
  return(
    <View>
      <ProductionCfTemp/>
      <ElectricityProduction/>
      <InlandCfImport/>
    </View>
  ) 
}

