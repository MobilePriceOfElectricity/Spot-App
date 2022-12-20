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
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#00FF00",
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
  },
  low: { shadowColor: 'green', borderColor: 'rgba(00, 255, 00, 0.15)' },
  middle: { shadowColor: 'orange', borderColor: 'rgba(255, 165, 00, 0.15)' },
  high: { shadowColor: 'red', borderColor: 'rgba(255, 00, 00, 0.15)' },
  title: {
    fontSize: 16,
    fontFamily: "MontserratRegular",
    color: '#a6d3d8',
  },
  itemprice: {
    width: 175,
    height: 175,
    backgroundColor: '#1f2131',
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 5,
    elevation: 30,
  }
});
