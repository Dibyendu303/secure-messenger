import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Message, User } from "../../src/models";
import { AntDesign, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PRIVATE_KEY } from "../../screens/SettingsScreen";
import { useNavigation } from "@react-navigation/native";
import { decrypt, stringToUint8Array } from "../../utils/crypto";
import { box } from "tweetnacl";

interface IMessageReplyProps {
  message: Message;
  setMessageReplyTo?: Function;
}

const MessageReply = ({ message, setMessageReplyTo }: IMessageReplyProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCurrUser();
    fetchUser();
  }, [message]);

  const fetchUser = async () => {
    try {
      const userID = message.userID;
      const user = await DataStore.query(User, userID);
      setUser(user);
    } catch (e) {
      console.log("Unable to fetch message user in reply message. ", e);
    }
  };
  const fetchCurrUser = async () => {
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);
      setCurrUser(dbUser);
    } catch (e) {
      console.log("Unable to fetch auth user in reply message. ", e);
    }
  };

  const decryptMessage = async (content) => {
    if (!user?.publicKey) {
      return;
    }
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
    try {
      const ourSecretKey = stringToUint8Array(ourSecretKeyString);
      const sharedKey = box.before(
        stringToUint8Array(user.publicKey),
        ourSecretKey
      );

      const decryptedMessage = decrypt(sharedKey, content);
      setLoading(false);
      return decryptedMessage.message;
    } catch (e) {
      console.log("Error in decrypting message. ");
    }
  };

  const getContent = () => {
    if (message.content) return decryptMessage(message.content);
    else if (message.image)
      return (
        <Text>
          <Feather name="image" size={12} color="grey" />
          Image
        </Text>
      );
    else if (message.audio)
      return (
        <Text>
          <MaterialCommunityIcons name="microphone" size={14} color="grey" />
          Audio
        </Text>
      );
    else return "";
  };

  if (!user && !currUser) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.replyContainer}>
      <View style={styles.nameContainer}>
        <Text
          style={[
            styles.replyUserName,
            { color: currUser?.name === user?.name ? "#0984e3" : "#6c5ce7" },
          ]}
        >
          {currUser?.name === user?.name ? "You" : user?.name}
        </Text>
        {setMessageReplyTo && (
          <Pressable onPress={() => setMessageReplyTo(null)}>
            <AntDesign name="close" size={20} color="black" />
          </Pressable>
        )}
      </View>
      <View>
        <Text style={{ color: "#636e72" }}>{getContent()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    backgroundColor: "#E8E8E8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  replyUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3777f0",
  },
});

export default MessageReply;
