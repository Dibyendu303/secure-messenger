import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
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
import { Auth, DataStore, Storage } from "aws-amplify";
import { ChatRoom, Message } from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import uriToBlob from "../../utils/uriToBlob";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImage(null);
    setProgress(0);
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const captureImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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
      resetFields();
      console.log("Message sent successfully");
    } catch (e) {
      console.log("Error while sending message");
      console.log(e);
    }
  };

  const progressCallback = (progress) => {
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!image) return;
    try {
      const blob = await uriToBlob(image);
      const { key } = await Storage.put(`${uuidv4()}.png`, blob, {
        progressCallback,
      });
      console.log("Image uploaded to Storage");

      try {
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(
          new Message({
            content: message,
            image: key,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
          })
        );
        updateLastMessage(newMessage);
        console.log("Successfully sent image as message");
        resetFields();
      } catch (e) {
        console.log("Error in sending image as message.");
        console.log(e);
      }
    } catch (e) {
      console.log("Error in uploading image to Storage");
      console.log(e);
    }
  };

  const updateLastMessage = async (newMessage) => {
    try {
      const original = await DataStore.query(ChatRoom, chatRoom.id);

      if (original) {
        await DataStore.save(
          ChatRoom.copyOf(original, (updated) => {
            updated.lastMessage = newMessage;
          })
        );
      }
    } catch (e) {
      console.log("Error while updating chat room last message");
      console.log(e);
    }
  };

  const onPlusClicked = () => {
    console.warn("On plus clicked");
  };

  const onPress = () => {
    if (image) sendImage();
    else if (message) sendMessage();
    else onPlusClicked();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      keyboardVerticalOffset={100}
    >
      {image && (
        <View style={styles.sendImageContainer}>
          <View style={styles.innerContainer}>
            <Image
              source={{ uri: image }}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
            <Pressable onPress={() => setImage(null)}>
              <AntDesign
                name="close"
                size={24}
                color="black"
                style={{ margin: 5 }}
              />
            </Pressable>
          </View>
          <View>
            <View
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "#3777f0",
                height: progress === 0 ? 0 : 5,
                borderRadius: 5,
              }}
            ></View>
          </View>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable
            onPress={() => setIsEmojiPickerOpen((prevState) => !prevState)}
          >
            <SimpleLineIcons
              name="emotsmile"
              color={"#595959"}
              size={24}
              style={styles.icons}
            />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Enter message"
            value={message}
            onChangeText={setMessage}
          />
          <Pressable onPress={pickImage}>
            <Feather
              name="image"
              size={24}
              color="#595959"
              style={styles.icons}
            />
          </Pressable>
          <Pressable onPress={captureImage}>
            <Feather
              name="camera"
              size={24}
              color="#595959"
              style={styles.icons}
            />
          </Pressable>
          <MaterialCommunityIcons
            name="microphone"
            color={"#595959"}
            size={24}
            style={styles.icons}
          />
        </View>
        <Pressable onPress={onPress} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>
            {message || image ? (
              <Ionicons name="send" size={25} color="white" />
            ) : (
              <AntDesign name="plus" size={25} color="white" />
            )}
          </Text>
        </Pressable>
      </View>
      {isEmojiPickerOpen && (
        <EmojiSelector
          onEmojiSelected={(emoji) =>
            setMessage((currMessage) => currMessage + emoji)
          }
          columns={8}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default MessageInput;
