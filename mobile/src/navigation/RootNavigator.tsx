import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import CalendarScreen from '../screens/CalendarScreen';
import TasksScreen from '../screens/TasksScreen';
import BudgetScreen from '../screens/BudgetScreen';
import SafetyScreen from '../screens/SafetyScreen';
import AuthScreen from '../screens/AuthScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Calendar: undefined;
  Tasks: undefined;
  Budget: undefined;
  Safety: undefined;
  Auth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'JoFamily' }} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Safety" component={SafetyScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login / Signup' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
