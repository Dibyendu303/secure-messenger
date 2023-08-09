import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amplify } from "aws-amplify";
import awsExports from "./src/aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react-native";
import "@azure/core-asynciterator-polyfill";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

Amplify.configure(awsExports);

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App);

// "plugins": [
//   [
//     "expo-image-picker",
//     {
//       "photosPermission": "The app accesses your photos to let you share them with your friends."
//     },
//     "expo-camera",
//     {
//       "cameraPermission": "Allow Secure Messenger to access your camera."
//     }
//   ]
// ]
