import { NavigationContainer } from '@react-navigation/native';
import {AntDesign} from '@expo/vector-icons';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; 
import { PricesScreen} from './PricesScreen';
import { PriceLimitsScreen } from './PriceLimitsScreen';
import { AlarmsScreen } from './AlarmsScreen';
import { ElCarScreen } from './ElCarScreen';
import { ContactScreen } from './ContactScreen';
import { HomeScreen } from './HomeScreen';
import {SettingsScreen} from './SettingsScreen';
import { useFonts } from 'expo-font';
import CustomDrawer from '../components/CustomDrawer';
import { createDrawerNavigator, DrawerContent } from '@react-navigation/drawer';
import { ImageBackground, View } from 'react-native';

const Drawer = createDrawerNavigator();




export default function DrawerNavigation(){

  let [fontsLoaded] = useFonts({
    MontserratRegular: require("../assets/fonts/Montserrat-Regular.ttf"),
    RampartOneRegular: require("../assets/fonts/RampartOne-Regular.ttf")
  })
  
  if (!fontsLoaded) {
    return null
  }

    return (
      
        <NavigationContainer>  
        <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />} 
        screenOptions={{
          headerTintColor: '#a6d3d8',
          fontFamily: 'MontserratRegular',
          headerShown: true,
          headerTitleStyle: { color: '#a6d3d8', fontSize: 25, fontFamily: "MontserratRegular"},

          drawerLabelStyle: {
            marginLeft: -15,
            fontFamily: "MontserratRegular"
          },
          
          headerStyle: { 
            backgroundColor: '#1f2131',
            borderBottomColor: '#D4850E',
            borderBottomWidth: 3,
            },
            
            drawerActiveTintColor:"#D4850E",
            drawerInactiveTintColor:"#a6d3d8",
            drawerStyle: {
            backgroundColor: '#1f2131',
          },
        }}>
        
        <Drawer.Screen  
          name="Koti"
          component= {HomeScreen} 
          options={{drawerIcon: () => <AntDesign name="home" size={23} color='#a6d3d8'/>}}
        />
        <Drawer.Screen 
        name ="Sähkönhinnat" 
        component={PricesScreen} 
        options={{drawerIcon: () => <AntDesign name="linechart" size={23} color='#a6d3d8'/>}}
        />
        <Drawer.Screen 
        name ="Hintarajat" 
        component={PriceLimitsScreen}
        options={{drawerIcon: () => <FontAwesome name="sliders" size={23} color='#a6d3d8'/>}} 
        />
        <Drawer.Screen 
        name ="Hälytykset" 
        component={AlarmsScreen}
        options={{drawerIcon: () => <AntDesign name="notification" size={23} color='#a6d3d8'/>}} 
        />
        <Drawer.Screen 
        name ="Sähköauto" 
        component={ElCarScreen}
        options={{drawerIcon: () => <MaterialCommunityIcons name="car-electric" size={23} color='#a6d3d8'/>}} 
        />
        <Drawer.Screen 
        name ="Ota yhteyttä" 
        component={ContactScreen}
        options={{drawerIcon: () => <MaterialCommunityIcons name="email" size={23} color='#a6d3d8'/>}} 
        />
        <Drawer.Screen 
        name ="Asetukset" 
        component={SettingsScreen}
        options={{drawerIcon: () => <AntDesign name="setting" size={23} color='#a6d3d8'/>}} 
        />

      </Drawer.Navigator>
        </NavigationContainer>
    );
}