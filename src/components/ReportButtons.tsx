
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ReportButtons = ({ onReport }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => onReport('Torton')}>
        <Icon name="truck" size={30} color="#fff" />
        <Text style={styles.buttonText}>Torton</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onReport('Trailer')}>
        <Icon name="truck-trailer" size={30} color="#fff" />
        <Text style={styles.buttonText}>Trailer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => onReport('Contenedor')}>
        <Icon name="train-car-container" size={30} color="#fff" />
        <Text style={styles.buttonText}>Contenedor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
  },
});

export default ReportButtons;
