import { View, Text, Pressable } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

const NewGroupButton = ({ onPress }) => {
  return (
    <View>
      <Pressable onPress={onPress}>
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "#3777f0",
              padding: 10,
              borderRadius: 50,
            }}
          >
            <MaterialIcons name="group" size={24} color="white" />
          </View>
          <Text style={{ fontWeight: "bold", fontSize: 15 }}>New Group</Text>
        </View>
      </Pressable>
      <Text style={{ fontWeight: "bold", color: "gray", padding: 10 }}>
        Contacts on Signal
      </Text>
    </View>
  );
};

export default NewGroupButton;
