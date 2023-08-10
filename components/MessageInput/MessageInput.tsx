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
import { ChatRoom, Message as MessageModel } from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import uriToBlob from "../../utils/uriToBlob";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Audio } from "expo-av";
import AudioPlayer from "../AudioPlayer";
import Message from "../Message";

interface IChatRoomProps {
  chatRoom: ChatRoom;
  messageReplyTo: MessageModel | null;
}

const MessageInput = ({ chatRoom, messageReplyTo }: IChatRoomProps) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [image, setImage] = useState<string>("");
  const [uploadprogress, setUploadProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImage("");
    setRecordingUri(null);
    setUploadProgress(0);
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
      setRecordingUri(null);
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
      setRecordingUri(null);
    }
  };

  const sendMessage = async () => {
    const user = await Auth.currentAuthenticatedUser();
    try {
      const newMessage = await DataStore.save(
        new MessageModel({
          content: message,
          userID: user.attributes.sub,
          chatroomID: chatRoom.id,
          status: "SENT",
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
    setUploadProgress(progress.loaded / progress.total);
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
          new MessageModel({
            content: message,
            image: key,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
            status: "SENT",
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

  const updateLastMessage = async (newMessage: MessageModel) => {
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

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    if (!recording) return;
    setRecording(null);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      setRecordingUri(uri);
      setImage("");
    } catch (e) {
      console.log("Error in saving recording.");
      console.log(e);
    }
  }

  const onPlusClicked = () => {
    console.warn("On plus clicked");
  };

  const onPress = () => {
    if (image) sendImage();
    else if (recordingUri) sendAudio();
    else if (message) sendMessage();
    else onPlusClicked();
  };

  const sendAudio = async () => {
    if (!recordingUri) return;
    const uriExtension = recordingUri.split(".").pop();
    try {
      const blob = await uriToBlob(recordingUri);
      const { key } = await Storage.put(`${uuidv4()}.${uriExtension}`, blob, {
        progressCallback,
      });
      console.log("Audio uploaded to Storage");

      try {
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(
          new MessageModel({
            content: message,
            audio: key,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
            status: "SENT",
          })
        );
        updateLastMessage(newMessage);
        console.log("Successfully sent audio as message");
        resetFields();
      } catch (e) {
        console.log("Error in sending audio as message.");
        console.log(e);
      }
    } catch (e) {
      console.log("Error in uploading audio to Storage");
      console.log(e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      keyboardVerticalOffset={100}
    >
      {messageReplyTo && (
        <View>
          <Message message={messageReplyTo} />
        </View>
      )}
      {image && (
        <View style={styles.sendImageContainer}>
          <View style={styles.innerContainer}>
            <Image
              source={{ uri: image }}
              style={{ width: 100, height: 100, borderRadius: 10 }}
            />
            <Pressable onPress={() => setImage("")}>
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
                width: `${uploadprogress * 100}%`,
                backgroundColor: "#3777f0",
                height: uploadprogress === 0 ? 0 : 5,
                borderRadius: 5,
              }}
            ></View>
          </View>
        </View>
      )}

      {recordingUri && (
        <View style={styles.sendAudioContainer}>
          <View style={styles.audioInnerContainer}>
            <AudioPlayer recordingUri={recordingUri} />
            <Pressable
              onPress={() => setRecordingUri(null)}
              style={{ marginRight: 10 }}
            >
              <AntDesign name="close" size={24} color="black" />
            </Pressable>
          </View>
          <View
            style={{
              width: `${uploadprogress * 100}%`,
              backgroundColor: "#3777f0",
              height: uploadprogress === 0 ? 0 : 5,
              borderRadius: 5,
            }}
          />
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
          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <MaterialCommunityIcons
              name="microphone"
              color={recording ? "red" : "#595959"}
              size={24}
              style={styles.icons}
            />
          </Pressable>
        </View>
        <Pressable onPress={onPress} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>
            {message || image || recordingUri ? (
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
