
import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';

const CameraScreen = ({ onRecordingFinished }) => {
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      const { uri } = await cameraRef.current.recordAsync();
      onRecordingFinished(uri);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}
      />
      <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
        {isRecording ? (
          <TouchableOpacity onPress={stopRecording} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> Detener Grabación </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startRecording} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> Iniciar Grabación </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default CameraScreen;
