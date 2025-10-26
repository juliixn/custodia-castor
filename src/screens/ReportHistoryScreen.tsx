
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase';

const ReportHistoryScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          Alert.alert('Error', error.message);
        } else {
          setReports(data);
        }
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>Tipo: {item.report_type}</Text>
      {item.vehicle_number && <Text>Vehículo: {item.vehicle_number}</Text>}
      <Text style={styles.itemDate}>Fecha: {new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return <Text>Cargando historial...</Text>;
  }

  return (
    <FlatList
      data={reports}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No has generado reportes.</Text>}
      contentContainerStyle={{ padding: 10 }}
    />
  );
};

const styles = StyleSheet.create({
    itemContainer: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#eee',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDate: {
        fontSize: 12,
        color: 'gray',
        marginTop: 5,
    }
  });

export default ReportHistoryScreen;
