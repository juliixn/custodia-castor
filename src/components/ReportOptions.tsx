
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ReportOptions = ({ onOptionSelected }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => onOptionSelected('acompanamiento')}
      >
        <Text style={styles.optionText}>Dar acompañamiento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => onOptionSelected('permanecer')}
      >
        <Text style={styles.optionText}>Permanecer en posición</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => onOptionSelected('indicaciones')}
      >
        <Text style={styles.optionText}>Esperar indicaciones</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ReportOptions;
