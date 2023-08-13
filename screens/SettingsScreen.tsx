import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { Auth, DataStore } from "aws-amplify";
import { generateKeyPair } from "../utils/crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../src/models";

export const PRIVATE_KEY = "PRIVATE_KEY";

const SettingsScreen = () => {
  const logOut = () => {
    Auth.signOut();
  };

  const updateKeyPair = async () => {
    // generate private/public key

    const { publicKey, secretKey } = generateKeyPair();

    // save private key to Async storage
    try {
      await AsyncStorage.setItem(PRIVATE_KEY, secretKey.toString());
    } catch (e) {
      console.log("Unable to save secret key in async storage. ", e);
    }

    // save public key to user model in datastore
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser?.attributes?.sub);

      if (!dbUser) {
        Alert.alert("Error", "User not found");
        return;
      }
      await DataStore.save(
        User.copyOf(dbUser, (updated) => {
          updated.publicKey = publicKey.toString();
        })
      );
      Alert.alert("Successfull", "Updated key pair");
    } catch (e) {
      console.log("Unable to save public key in datastore. ", e);
    }
  };

  return (
    <View>
      <Text>Settings</Text>
      <Pressable
        onPress={updateKeyPair}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
        }}
      >
        <Text style={{ color: "white" }}>Update key pair</Text>
      </Pressable>
      <Pressable
        onPress={logOut}
        style={{
          backgroundColor: "#3777f0",
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          margin: 10,
        }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default SettingsScreen;
