
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase';

const ProfileScreen = ({ route }) => {
  const { profile } = route.params;
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username, full_name: fullName })
      .eq('id', profile.id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    }
    // onAuthStateChange in App.tsx will handle navigation
    setLoading(false);
  };

  return (
    <View style={styles.container}>
        <Text style={styles.label}>Email</Text>
        <TextInput
            style={styles.input}
            value={profile?.id}
            editable={false}
        />
        <Text style={styles.label}>Nombre de Usuario</Text>
        <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Tu nombre de usuario"
        />
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre completo"
        />

        <Button title="Actualizar Perfil" onPress={handleUpdateProfile} disabled={loading} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Cerrar Sesión" onPress={handleSignOut} disabled={loading} color="#e74c3c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
});

export default ProfileScreen;
