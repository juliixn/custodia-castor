
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Linking, AppState } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { supabase } from '../supabase';
import { Buffer } from 'buffer';

const CameraScreen = ({ navigation }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef(null);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            requestPermission(); // Re-check permission when app comes to foreground
        }
        setAppState(nextAppState);
      });
  
      return () => {
        subscription.remove();
      };
  }, [appState, requestPermission]);

  const takePhotoAndUpload = async () => {
    if (!camera.current) {
      Alert.alert('Error', 'La cámara no está disponible.');
      return;
    }

    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false
      });

      Alert.alert('Foto tomada', `Ruta: ${photo.path}. Subiendo...`);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Read the file as a buffer
      const response = await fetch(photo.path);
      const blob = await response.blob();

      const fileName = `public/${user.id}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('sos_photos')
        .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      Alert.alert('Éxito', 'La foto ha sido subida correctamente.');
      navigation.goBack();

    } catch (error) {
      console.error('Error al tomar o subir la foto:', error);
      Alert.alert('Error', `No se pudo procesar la foto: ${error.message}`);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Necesitamos tu permiso para usar la cámara.</Text>
        <Button title="Conceder Permiso" onPress={requestPermission} />
      </View>
    );
  }

  if (device == null) {
    return (
        <View style={styles.container}>
            <Text style={styles.permissionText}>No se encontró un dispositivo de cámara.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <View style={styles.captureContainer}>
        <TouchableOpacity onPress={takePhotoAndUpload} style={styles.captureButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 5,
    borderColor: '#ccc',
  },
});

export default CameraScreen;
