import { View, Text, Image } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

const ChatRoomHeader = (props) => {
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
          uri: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg",
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          fontWeight: "bold",
          marginLeft: 10,
        }}
      >
        {props.children}
      </Text>
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
