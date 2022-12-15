import { StyleSheet } from 'react-native';

/* COLORS:
#16171D
#1f2131
#a6d3d8
#d0ece7
#afd3ff
#d4850e
*/


export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#16171d',
    },
    home: {
      flex: 1,
      backgroundColor: '#16171d',
      alignItems: 'center',
      justifyContent: 'center', 
    },
    chartit: {
      paddingVertical: 20,
      paddingHorizontal: 10,
    },
    text: {
      color: '#a6d3d8',
      fontFamily: "MontserratRegular"
    },
    item: {
      backgroundColor: '#1f2131',
      padding: 10,
      marginVertical: 12,
      marginHorizontal: 20,
      borderRadius: 100,
      //paddingHorizontal: 40,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#00FF00",
      //shadowOpacity: 5,
      elevation: 10,
      shadowRadius: 50
      
    },
    title: {
      fontSize: 16,
      fontFamily: "MontserratRegular",
      color: '#a6d3d8',

    },
    button: {
      backgroundColor: '#16171D',
      marginRight: 200,
      borderRadius: 5
    }
  });