import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>JoFamily Mobile</Text>
      <Text style={styles.subtitle}>Phase 5: Mobile Ready (Expo + TS)</Text>
      <View style={styles.grid}>
        <Button title="Chat" onPress={() => navigation.navigate('Chat')} />
        <Button title="Calendar" onPress={() => navigation.navigate('Calendar')} />
        <Button title="Tasks" onPress={() => navigation.navigate('Tasks')} />
        <Button title="Budget" onPress={() => navigation.navigate('Budget')} />
        <Button title="Safety" onPress={() => navigation.navigate('Safety')} />
        <Button title="Login / Signup" onPress={() => navigation.navigate('Auth')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
  },
  grid: {
    gap: 10,
  },
});
