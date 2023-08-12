import { View, Text, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../../src/models";
import UserItem from "../../components/UserItem";

const GroupInfoScreen = () => {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const route = useRoute();

  useEffect(() => {
    if (!route.params?.id) {
      console.warn("No chat room id provided");
      return;
    }
    fetchChatRoom(route.params.id);
    fetchUsers(route.params.id);
  }, [route]);

  const fetchChatRoom = async (id) => {
    const chatRoom = await DataStore.query(ChatRoom, id);
    if (!chatRoom) {
      console.error("Could not find a chat room with this id: ", id);
    } else {
      setChatRoom(chatRoom);
    }
  };

  const fetchUsers = async (id) => {
    const chatRoomUserIds = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatRoomId === id)
      .map((user) => user.userId);

    const chatRoomUsers = await Promise.all(
      chatRoomUserIds.map(async (id) => await DataStore.query(User, id))
    );
    setAllUsers(chatRoomUsers);
  };

  const confirmRemove = async (user) => {
    const authUser = await Auth.currentAuthenticatedUser();
    if (authUser.attributes.sub !== chatRoom?.chatRoomAdminId) {
      Alert.alert(
        "Action not allowed",
        `Only admin can remove members of a group`
      );
      return;
    }

    if (user.id === chatRoom?.chatRoomAdminId) {
      Alert.alert(
        "Action not allowed",
        `You cannot remove the admin of a group`
      );
      return;
    }
    Alert.alert(
      `Remove ${user.name}`,
      `Are you sure want to remove ${user.name} from the group`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeUser(user),
          style: "destructive",
        },
      ]
    );
  };

  const removeUser = async (user) => {
    // await DataStore.delete();
    const toDelete = await DataStore.query(ChatRoomUser, (c) =>
      c.and((c) => [c.userId.eq(user.id), c.chatRoomId.eq(chatRoom.id)])
    );

    if (toDelete) {
      try {
        await DataStore.delete(toDelete[0]);
        const filteredArr = allUsers.filter((item) => item.id !== user.id);
        setAllUsers(filteredArr);
        console.log(`Removed ${user.name}: ${user.id} from the group.`);
      } catch (e) {
        console.log(
          `Unable to delete user ${user.id} from chatroom ${chatRoom.id}.`,
          e
        );
      }
    }
  };
  return (
    <View>
      <Text style={{ fontWeight: "bold", color: "gray", padding: 10 }}>
        Users ({allUsers.length})
      </Text>
      <FlatList
        data={allUsers}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onLongPress={() => confirmRemove(item)}
            isAdmin={chatRoom?.chatRoomAdminId === item.id}
          />
        )}
      />
    </View>
  );
};

export default GroupInfoScreen;
