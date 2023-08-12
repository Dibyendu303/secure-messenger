import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  Alert,
} from "react-native";
import UserItem from "../components/UserItem";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import NewGroupButton from "../components/NewGroupButton";
import { useNavigation } from "@react-navigation/native";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState<boolean>(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    // query users
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await DataStore.query(User);
        setUsers(fetchedUsers);
        try {
          const authUser = await Auth.currentAuthenticatedUser();
          dbUser = await DataStore.query(User, authUser.attributes.sub);
          const otherUsers = fetchedUsers.filter(
            (user) => user.id !== authUser.attributes.sub
          );
          setUsers(otherUsers);
        } catch (e) {
          console.log("Error in getting authenticated user");
          console.log(e);
        }
      } catch (e) {
        console.log("Unable to fetch users from Datastore");
        console.log(e);
      }
    };
    fetchUsers();
  }, []);

  const findCommonChatRoomList = (arr1, arr2) => {
    return arr1.filter((value) => arr2.includes(value));
  };

  const getPreviousChatRoom = async (user: User) => {
    let dbUser: User | null = null;
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      dbUser = await DataStore.query(User, authUser.attributes.sub);
    } catch (e) {
      console.log("Error in getting authenticated user");
      console.log(e);
    }
    if (!dbUser) return null;
    // check if there is already a chatroom then redirect there
    const myChatRooms = (
      await DataStore.query(ChatRoomUser, (chatRoomUser) =>
        chatRoomUser.userId.eq(dbUser.id)
      )
    ).map((chatRoomUser) => chatRoomUser.chatRoomId);

    const userChatRooms = (
      await DataStore.query(ChatRoomUser, (chatRoomUser) =>
        chatRoomUser.userId.eq(user.id)
      )
    ).map((chatRoomUser) => chatRoomUser.chatRoomId);

    const commonChatRooms = findCommonChatRoomList(myChatRooms, userChatRooms);
    if (commonChatRooms.length > 0) {
      for (let id of commonChatRooms) {
        if (id) return id;
      }
    } else return null;
  };

  const createChatRoom = async (users: User[]) => {
    let dbUser: User | null = null;
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      dbUser = await DataStore.query(User, authUser.attributes.sub);
    } catch (e) {
      console.log("Error in getting authenticated user");
      console.log(e);
    }
    if (!dbUser) {
      Alert.alert(
        "Internal Server Error",
        "There was an error creating the group"
      );
      return;
    }
    const newChatRoomData = {
      newMessages: 0,
      Admin: dbUser,
    };
    if (users.length > 1) {
      newChatRoomData.name = "New group";
      newChatRoomData.imageUri =
        "https://dib-aws-bucket.s3.ap-south-1.amazonaws.com/group_icon.png";
    }
    try {
      // create a chat room
      const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));
      try {
        // add authenticated user to the chat room
        await DataStore.save(
          new ChatRoomUser({
            user: dbUser,
            chatRoom: newChatRoom,
          })
        );

        // add clicked users to the chat room
        await Promise.all(
          users.map(async (selectedUser) => {
            return await DataStore.save(
              new ChatRoomUser({
                user: selectedUser,
                chatRoom: newChatRoom,
              })
            );
          })
        );

        navigation.navigate("ChatRoom", { id: newChatRoom.id });
      } catch (e) {
        console.log("Error in adding users to chatroom");
        console.log(e);
      }
    } catch (e) {
      console.log("Error in creating chatroom.");
      console.log(e);
    }
  };

  const isUserSelected = (user: User) => {
    return selectedUsers.some((selectedUser) => user.id === selectedUser.id);
  };

  const onUserPress = async (user: User) => {
    if (isNewGroup) {
      if (isUserSelected(user)) {
        // remove from selected
        const filteredArr = selectedUsers.filter(
          (selectedUser) => selectedUser.id !== user.id
        );
        setSelectedUsers(filteredArr);
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      const previousChatRoom = await getPreviousChatRoom(user);
      if (previousChatRoom === null) await createChatRoom([user]);
      else navigation.navigate("ChatRoom", { id: previousChatRoom });
    }
  };

  const saveGroup = async () => {
    await createChatRoom(selectedUsers);
  };

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}
          />
        )}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />
      {isNewGroup && selectedUsers.length > 0 && (
        <Pressable style={styles.button} onPress={saveGroup}>
          <Text style={styles.buttonText}>
            Save group ({selectedUsers.length})
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
  button: {
    backgroundColor: "#3777f0",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
