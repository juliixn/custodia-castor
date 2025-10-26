
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ReportButtons from '../components/ReportButtons';
import ReportOptions from '../components/ReportOptions';
import { supabase } from '../supabase';

const MainScreen = ({ route, navigation }) => {
  const { userType } = route.params;
  const [location, setLocation] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [isAccompaniment, setIsAccompaniment] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const handleReport = (type) => {
    setReportType(type);
    setIsReporting(true);
  };

  const handleVehicleNumberSubmit = async () => {
    if (!session) {
      Alert.alert('Error', 'Debes iniciar sesión para enviar un reporte.');
      return;
    }

    const { error } = await supabase.from('reports').insert([
      {
        report_type: reportType,
        vehicle_number: vehicleNumber,
        latitude: location.latitude,
        longitude: location.longitude,
        user_id: session.user.id,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setIsReporting(false);
      setShowReportOptions(true);
    }
  };

  const handleOptionSelected = async (option) => {
    setShowReportOptions(false);
    setVehicleNumber('');

    if (option === 'acompanamiento') {
      setIsAccompaniment(true);
    } else if (option === 'permanecer') {
      if (!session) {
        Alert.alert('Error', 'Debes iniciar sesión para enviar un reporte.');
        return;
      }
      const { error } = await supabase.from('reports').insert([
        {
          report_type: 'permanecer',
          latitude: location.latitude,
          longitude: location.longitude,
          user_id: session.user.id,
        },
      ]);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        alert('Reporte enviado: Permanecer en posición');
      }
    } else if (option === 'indicaciones') {
      navigation.navigate('Chat');
    }
  };

  const handleEndAccompaniment = () => {
    setIsAccompaniment(false);
    alert('Acompañamiento finalizado');
  };

  const handleSOS = () => {
    Linking.openURL('tel:999');
    navigation.navigate('Camera');
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {userType === 'custodio' && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Mi Ubicación"
            />
          )}
        </MapView>
      )}

      {userType === 'custodio' && !isReporting && !showReportOptions && !isAccompaniment && (
        <ReportButtons onReport={handleReport} />
      )}

      {isReporting && (
        <View style={styles.reportingContainer}>
          <Text style={styles.reportingTitle}>Reportar {reportType}</Text>
          <TextInput
            style={styles.input}
            placeholder="Número Económico"
            keyboardType="numeric"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />
          <View style={styles.reportingButtons}>
            <TouchableOpacity style={styles.reportingButton} onPress={handleVehicleNumberSubmit}>
                <Text style={styles.reportingButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showReportOptions && <ReportOptions onOptionSelected={handleOptionSelected} />}

      {isAccompaniment && (
        <View style={styles.accompanimentContainer}>
            <TouchableOpacity style={[styles.accompanimentButton, styles.sosButton]} onPress={handleSOS}>
                <Text style={styles.accompanimentButtonText}>SOS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accompanimentButton} onPress={handleEndAccompaniment}>
                <Text style={styles.accompanimentButtonText}>Finalizar</Text>
            </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  reportingContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  reportingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  reportingButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
    reportingButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  reportingButtonText: {
      color: 'white',
  },
  accompanimentContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  accompanimentButton: {
    backgroundColor: '#2ecc71',
    padding: 20,
    borderRadius: 10,
  },
  sosButton: {
    backgroundColor: '#e74c3c',
  },
  accompanimentButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainScreen;
