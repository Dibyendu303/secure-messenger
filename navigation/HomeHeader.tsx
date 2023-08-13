import { View, Text, Image, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import { User } from "../src/models";

const HomeHeader = (props) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);
      setUser(dbUser);
    };
    fetchUser();
  }, []);

  const navigation = useNavigation();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Image
        source={{
          uri: user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text
        style={{
          flex: 1,
          textAlign: "center",
          fontWeight: "bold",
          marginLeft: 35,
        }}
      >
        Signal
      </Text>
      <Pressable onPress={() => navigation.navigate("Settings")}>
        <AntDesign
          name="setting"
          size={24}
          color="black"
          style={{ marginRight: 20 }}
        />
      </Pressable>
      <Pressable onPress={() => navigation.navigate("UsersScreen")}>
        <Feather name="edit-2" size={24} color="black" />
      </Pressable>
    </View>
  );
};

export default HomeHeader;
