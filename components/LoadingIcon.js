import { StyleSheet, View, Animated, Easing} from 'react-native';
import React, {useEffect, useRef} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function LoadingIcon() {

  useEffect(() => { 
    spinAnim()
  },[])

   const spin = useRef(new Animated.Value(0)).current;

   function spinAnim() {
    Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 700,
          easing: Easing.linear,
          useNativeDriver: false,
        }
      )
      ).start();
   };

return (
    <View style={StyleSheet.container}> 
      <Animated.View
        style={[
        styles.fadingContainer,
          {
            transform: [{
            rotate: spin.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
              })
            }], 
          }
        ]}
      >
      <MaterialCommunityIcons name="loading" size={24} color="black" />
      </Animated.View>         
    </View>
  );
}
    
