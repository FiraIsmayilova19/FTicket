import React, { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import EventsScreen from "./screens/EventsScreen";
import AdminCreateEventScreen from "./screens/AdminCreateEventScreen";
import AdminSeatDesignerScreen from "./screens/AdminSeatDesignerScreen";

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"events" | "adminCreate" | "adminSeats">("events");

  // login olmamış istifadəçi üçün
  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={() => {
          setIsLoggedIn(true);
          setIsAdmin(true); // admin hesabı ilə login
          setCurrentScreen("events"); // login olduqdan sonra EventsScreen açılır
        }}
        onGuestContinue={() => {
          setIsLoggedIn(true);
          setIsAdmin(false); // guest olaraq daxil oldu
          setCurrentScreen("events"); // guest də EventsScreen görür
        }}
      />
    );
  }

  // login olduqdan sonra ekran yönləndirməsi
  switch (currentScreen) {
    case "events":
      return <EventsScreen />;
    case "adminCreate":
      return isAdmin ? <AdminCreateEventScreen /> : <EventsScreen />;
    case "adminSeats":
      return isAdmin ? <AdminSeatDesignerScreen /> : <EventsScreen />;
    default:
      return <EventsScreen />;
  }
}
