import { View, Text, StyleSheet } from 'react-native';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budget</Text>
      <Text style={styles.body}>Budget analytics will render here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 16, color: '#475569' },
});
