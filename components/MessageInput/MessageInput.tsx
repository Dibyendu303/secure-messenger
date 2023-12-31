import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
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
import {
  ChatRoom,
  ChatRoomUser,
  Message as MessageModel,
  User,
} from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import uriToBlob from "../../utils/uriToBlob";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Audio } from "expo-av";
import AudioPlayer from "../AudioPlayer";
import MessageReply from "../MessageReply";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIVATE_KEY } from "../../screens/SettingsScreen";
import { useNavigation } from "@react-navigation/native";
import { box } from "tweetnacl";
import { encrypt, stringToUint8Array } from "../../utils/crypto";

interface IChatRoomProps {
  chatRoom: ChatRoom;
  messageReplyTo: MessageModel | null;
  setMessageReplyTo: Function;
}

const MessageInput = ({
  chatRoom,
  messageReplyTo,
  setMessageReplyTo,
}: IChatRoomProps) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [image, setImage] = useState<string>("");
  const [uploadprogress, setUploadProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const navigation = useNavigation();

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImage("");
    setRecordingUri(null);
    setUploadProgress(0);
    setMessageReplyTo(null);
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

  const sendMessageToUser = async (user: User, fromUserId: string) => {
    try {
      // encrypt using our secret key and recipient's public key
      const ourSecretKeyString = await AsyncStorage.getItem(PRIVATE_KEY);
      if (!ourSecretKeyString) {
        Alert.alert(
          `You haven't generated your key pair yet.`,
          `Go to settings and generate a new key pair`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Go to Settings",
              onPress: () => navigation.navigate("Settings"),
              style: "default",
            },
          ]
        );
        return;
      }

      if (!user?.publicKey) {
        Alert.alert(
          `Can't send message`,
          `${user.name} has not generated a key pair yet.`
        );
        return;
      }

      const ourSecretKey = stringToUint8Array(ourSecretKeyString);
      const sharedKey = box.before(
        stringToUint8Array(user.publicKey),
        ourSecretKey
      );
      const encryptedMessage = encrypt(sharedKey, { message });

      let key = null;
      if (image) {
        try {
          const blob = await uriToBlob(image);
          const resp = await Storage.put(`${uuidv4()}.png`, blob, {
            progressCallback,
          });
          key = resp.key;
          console.log("Image uploaded to Storage");
        } catch (e) {
          console.log("Error in uploading image to storage. ", e);
        }
      }

      let audioKey = null;
      if (recordingUri) {
        const uriExtension = recordingUri.split(".").pop();
        try {
          const blob = await uriToBlob(recordingUri);
          const resp = await Storage.put(`${uuidv4()}.${uriExtension}`, blob, {
            progressCallback,
          });
          audioKey = resp.key;
          console.log("Audio uploaded to Storage");
        } catch (e) {
          console.log("Error in uploading audio to Storage. ", e);
        }
      }

      const newMessage = await DataStore.save(
        new MessageModel({
          content: encryptedMessage,
          image: key,
          audio: audioKey,
          userID: fromUserId,
          chatroomID: chatRoom.id,
          forUserId: user.id,
          status: "SENT",
          replyTo: messageReplyTo?.id,
        })
      );

      // updateLastMessage(newMessage);
      console.log("Message sent successfully");
    } catch (e) {
      console.log("Error while sending message. ", e);
    }
  };

  const sendMessage = async () => {
    // get all the users of this chatroom
    const userIds = (
      await DataStore.query(ChatRoomUser, (c) => c.chatRoomId.eq(chatRoom.id))
    ).map((user) => user.userId);

    const users = await Promise.all(
      userIds.map(
        async (selectedUser) => await DataStore.query(User, selectedUser)
      )
    );

    const authUser = await Auth.currentAuthenticatedUser();

    // for each user, encrypt the content with his public key and save it as a new message
    await Promise.all(
      users.map(
        async (user) => await sendMessageToUser(user, authUser.attributes.sub)
      )
    );

    resetFields();
  };

  const progressCallback = (progress) => {
    setUploadProgress(progress.loaded / progress.total);
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
      console.log("Error while updating chat room last message. ", e);
    }
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording. ", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setRecording(null);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      setRecordingUri(uri);
      setImage("");
    } catch (e) {
      console.log("Error in saving recording. ", e);
    }
  }

  const onPlusClicked = () => {
    console.warn("On plus clicked");
  };

  const onPress = () => {
    if (message || recordingUri || image) sendMessage();
    else onPlusClicked();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      keyboardVerticalOffset={100}
    >
      {messageReplyTo && (
        <MessageReply
          message={messageReplyTo}
          setMessageReplyTo={setMessageReplyTo}
        />
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
