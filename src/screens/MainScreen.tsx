
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Linking, Alert, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ReportButtons from '../components/ReportButtons';
import ReportOptions from '../components/ReportOptions';
import { supabase } from '../supabase';

const MainScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [location, setLocation] = useState(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [isAccompaniment, setIsAccompaniment] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});

  const mapRef = useRef(null);
  const realtimeChannel = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setUserProfile(profile);
        }
      }
    };
    fetchProfile();
  }, []);

  // Setup Header and Geolocation
  useLayoutEffect(() => {
    if (userProfile) {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <Button
              onPress={() => navigation.navigate('ReportHistory')}
              title="Historial"
            />
            <Button
              onPress={() => navigation.navigate('Profile', { profile: userProfile })}
              title="Perfil"
            />
          </View>
        ),
      });
    }

    const watchId = Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        if (realtimeChannel.current) {
          realtimeChannel.current.send({
            type: 'broadcast',
            event: 'position',
            payload: { user_id: userProfile?.id, location: newLocation },
          });
        }
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [navigation, userProfile]);

  // Setup Supabase Realtime
  useEffect(() => {
    if (userProfile) {
        realtimeChannel.current = supabase.channel('public:locations', {
            config: {
              presence: {
                key: userProfile.id,
              },
            },
          });

      realtimeChannel.current
        .on('presence', { event: 'sync' }, () => {
          const newState = realtimeChannel.current.presenceState();
          setOnlineUsers(newState);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          setOnlineUsers(prev => ({...prev, [key]: newPresences[0]}));
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          setOnlineUsers(prev => {
            const newState = {...prev};
            delete newState[key];
            return newState;
          });
        })
        .on('broadcast', { event: 'position' }, (payload) => {
            setOnlineUsers(prev => ({
                ...prev,
                [payload.payload.user_id]: { ...prev[payload.payload.user_id], location: payload.payload.location }
            }));
        })
        .on('broadcast', { event: 'report' }, (payload) => {
            Alert.alert('Nuevo Reporte', `Reporte de ${payload.payload.report_type} del vehiculo ${payload.payload.vehicle_number}`);
        })
        .on('broadcast', { event: 'sos' }, ({ payload }) => {
            Alert.alert('¡¡¡SOS!!!', `El usuario ${payload.user_id} ha presionado el botón de pánico.`);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await realtimeChannel.current.track({ user_id: userProfile.id, location });
          }
        });
    }

    return () => {
      if (realtimeChannel.current) {
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [userProfile, location]);


  const handleReport = (type) => {
    setReportType(type);
    setIsReporting(true);
  };

  const handleVehicleNumberSubmit = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'No se ha podido identificar al usuario.');
      return;
    }

    const { error } = await supabase.from('reports').insert([
      {
        report_type: reportType,
        vehicle_number: vehicleNumber,
        latitude: location.latitude,
        longitude: location.longitude,
        user_id: userProfile.id,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
        realtimeChannel.current.send({
            type: 'broadcast',
            event: 'report',
            payload: { report_type: reportType, vehicle_number: vehicleNumber },
          });
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
        alert('Reporte enviado: Permanecer en posición');
    } else if (option === 'indicaciones') {
      navigation.navigate('Chat');
    }
  };

  const handleEndAccompaniment = () => {
    setIsAccompaniment(false);
    alert('Acompañamiento finalizado');
  };

  const handleSOS = () => {
    realtimeChannel.current.send({
        type: 'broadcast',
        event: 'sos',
        payload: { user_id: userProfile.id },
      });
    Linking.openURL('tel:999');
    navigation.navigate('Camera');
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {userProfile && location && (
            <Marker
              coordinate={location}
              title="Mi Ubicación"
              pinColor={userProfile.role === 'supervisor' ? 'blue' : 'red'}
            />
          )}
          {userProfile?.role === 'supervisor' && Object.keys(onlineUsers).map(key => {
            const user = onlineUsers[key];
            if(user.user_id !== userProfile.id && user.location) {
                return (
                    <Marker
                        key={user.user_id}
                        coordinate={user.location}
                        title={`Usuario ${user.user_id}`}
                    />
                )
            }
            return null;
          })}
        </MapView>
      )}

      {userProfile?.role === 'custodio' && !isReporting && !showReportOptions && !isAccompaniment && (
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
          <Button title="OK" onPress={handleVehicleNumberSubmit} />
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
