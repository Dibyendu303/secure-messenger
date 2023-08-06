import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import styles from "./styles";
import {
  SimpleLineIcons,
  Ionicons,
  AntDesign,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const MessageInput = () => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    console.warn("Sending: ", message);
    setMessage("");
  };

  const onPlusClicked = () => {
    console.warn("On plus clicked");
  };

  const onPress = () => {
    if (message) sendMessage();
    else onPlusClicked();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
      keyboardVerticalOffset={100}
    >
      <View style={styles.inputContainer}>
        <SimpleLineIcons
          name="emotsmile"
          color={"#595959"}
          size={24}
          style={styles.icons}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter message"
          value={message}
          onChangeText={setMessage}
        />
        <Feather name="camera" size={24} color="#595959" style={styles.icons} />
        <MaterialCommunityIcons
          name="microphone"
          color={"#595959"}
          size={24}
          style={styles.icons}
        />
      </View>
      <Pressable onPress={onPress} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>
          {message ? (
            <Ionicons name="send" size={25} color="white" />
          ) : (
            <AntDesign name="plus" size={25} color="white" />
          )}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

export default MessageInput;
