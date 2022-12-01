import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';



const CustomDrawer = props => {
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: ''}}>
        <ImageBackground
          
          style={{padding: 10}}>
          <Image
            source={require('../assets/images/logotest4.png')}
            style={{height: 180, width: 250, marginLeft: 10,  }}
          />
          
          
        </ImageBackground>
        <View style={{flex: 1, backgroundColor: '', paddingTop: 10}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      
    </View>
  );
};

export {CustomDrawer};