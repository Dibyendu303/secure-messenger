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
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, Message } from "../../src/models";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    const user = await Auth.currentAuthenticatedUser();
    try {
      const newMessage = await DataStore.save(
        new Message({
          content: message,
          userID: user.attributes.sub,
          chatroomID: chatRoom.id,
        })
      );

      updateLastMessage(newMessage);
      setMessage("");
      console.log("Message sent successfully");
    } catch (e) {
      console.log("Error while sending message");
      console.log(e);
    }
  };

  const updateLastMessage = async (newMessage) => {
    const original = await DataStore.query(ChatRoom, chatRoom.id);

    if (original) {
      const updatedChatRoom = await DataStore.save(
        ChatRoom.copyOf(original, (updated) => {
          updated.lastMessage = newMessage;
        })
      );
    }
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
