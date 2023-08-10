import { View, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Auth, DataStore } from "aws-amplify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChatRoomUser, User } from "../src/models";

dayjs.extend(relativeTime);

const ChatRoomHeader = ({ id }) => {
  const [displayUser, setDisplayUser] = useState<User | null>(null);

  useEffect(() => {
    if (!displayUser) return;
    const subscription = DataStore.observe(User, displayUser.id).subscribe(
      (msg) => {
        // console.log(msg.model, msg.opType, msg.element);
        if (msg.model === User && msg.opType === "UPDATE") {
          const newData = { ...displayUser, ...msg.element };
          setDisplayUser(newData);
          console.log("Updating user data: ");
          console.log("Name: ", newData.name);
          console.log(
            "Last seen: ",
            new Date(newData.lastOnlineAt).toTimeString()
          );
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [displayUser]);

  useEffect(() => {
    if (!id) return;
    const fetchUsers = async () => {
      const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
        .map((user) => user.userId);

      const chatRoomUsers = await Promise.all(
        chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
      );
      const authUser = await Auth.currentAuthenticatedUser();
      setDisplayUser(
        chatRoomUsers.find((user) => user.id !== authUser.attributes.sub) ||
          null
      );
    };
    fetchUsers();
  }, []);

  const getLastOnlineText = () => {
    if (!displayUser?.lastOnlineAt) return null;
    const diff = new Date().getTime() - displayUser.lastOnlineAt;
    if (diff < 5 * 60 * 1000) return "Online";
    const time = dayjs(displayUser.lastOnlineAt).fromNow();
    return `Last seen: ${time}`;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "110%",
        marginLeft: "-10%",
      }}
    >
      <Image
        source={{
          uri: displayUser?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <View
        style={{
          flex: 1,
          marginLeft: 10,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {displayUser?.name}
        </Text>
        {displayUser?.lastOnlineAt && (
          <Text style={{ fontSize: 12, color: "gray" }}>
            {getLastOnlineText()}
          </Text>
        )}
      </View>
      <Feather
        name="camera"
        size={24}
        color="black"
        style={{ marginRight: 20 }}
      />
      <Feather name="edit-2" size={24} color="black" />
    </View>
  );
};

export default ChatRoomHeader;
