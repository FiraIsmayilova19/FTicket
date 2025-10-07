import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import EventsScreen from "../screens/EventsScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import AdminCreateEventScreen from "../screens/AdminCreateEventScreen";
import AdminSeatDesignerScreen from "../screens/AdminSeatDesignerScreen";

export type RootStackParamList = {
    Login: undefined;
    Events: undefined;
    EventDetail: { id: number };
    AdminCreateEvent: undefined;
    AdminSeatDesigner: { eventId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: true }}>
                {!isLoggedIn ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Events" component={EventsScreen} />
                        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
                        <Stack.Screen name="AdminCreateEvent" component={AdminCreateEventScreen} />
                        <Stack.Screen name="AdminSeatDesigner" component={AdminSeatDesignerScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
