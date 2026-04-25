import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SessionDrawerContent from "@/components/SessionDrawerContent";

export default function AuthedLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <SessionDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerType: "slide",
          drawerStyle: { width: 300 },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Votrix" }} />
        <Drawer.Screen
          name="c/[sessionId]"
          options={{ title: "Chat" }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
