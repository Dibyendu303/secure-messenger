import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amplify, Auth, DataStore, Hub } from "aws-amplify";
import awsExports from "./src/aws-exports";
import { withAuthenticator } from "@aws-amplify/ui-react-native";
import "@azure/core-asynciterator-polyfill";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { Message, User } from "./src/models";

Amplify.configure(awsExports);

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Create listener
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      // console.log("Event: ", event);
      // console.log("Data:", data);
      if (event === "networkStatus") {
        console.log(`User has a network connection: ${data.active}`);
      }
      if (
        event === "outboxMutationProcessed" &&
        data.model === Message &&
        !["DELIVERED", "READ"].includes(data.element.status)
      ) {
        // set the message status to delivered
        DataStore.save(
          Message.copyOf(data.element, (updated) => {
            updated.status = "DELIVERED";
          })
        );
      }
    });

    // Remove listener
    return () => listener();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      await updateLastOnline();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUser = async () => {
    const authUser = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, authUser.attributes.sub);
    if (user) {
      setUser(user);
    }
  };

  const updateLastOnline = async () => {
    if (!user) return;
    await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = new Date().getTime();
      })
    );
    console.log("Updating time: ", new Date().toTimeString());
  };

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
//     },
//     "expo-av",
//     {
//       "microphonePermission": "Allow Secure Messenger to access your microphone."
//     }
//   ]
// ]
