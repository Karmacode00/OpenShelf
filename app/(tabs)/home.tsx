import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Campo de búsqueda */}
      <TextInput style={styles.searchInput} placeholder="Buscar libros..." />

      {/* Sección Mis Libros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Libros</Text>
        {/* Aquí luego insertarás el componente de lista de libros */}
      </View>

      {/* Sección Mis Préstamos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mis Préstamos</Text>
        {/* Aquí luego insertarás el componente de lista de préstamos */}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
