import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AppliancesScreen from "./AppliancesScreen";
import AddScreen from './AddScreen';

const OwnInfo = () => {
    
    const Stack = createNativeStackNavigator();
    return (
      <NavigationContainer>
        <Stack.Navigator initilRouterName="Home">
        <Stack.Screen
          name="Home"
          component={AppliancesScreen}
          options={{
            title:"Omat kodinkoneet",
            HeaderTitle: "Home",
          }} 
          />
         <Stack.Screen
          name="Add"
          component={AddScreen}
          options={{
            title:"Lisää kodinkone",
            HeaderTitle: "Add",
          }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
export {OwnInfo}