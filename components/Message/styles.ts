import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingVertical: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "75%",
    // backgroundColor: "yellow",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: "auto",
  },
  innerContainer: {
    // backgroundColor: "lightblue",
    maxWidth: "95%",
  },
  sentMessageContainer: {
    paddingRight: 5,
    marginLeft: "auto",
    marginRight: 10,
    backgroundColor: "lightgrey",
  },
  receivedMessageContainer: {
    paddingRight: 10,
    marginLeft: 10,
    marginRight: "auto",
    backgroundColor: "#3777f0",
  },
  sentText: {
    color: "black",
  },
  receivedText: {
    color: "white",
  },
  statusContainer: {
    marginHorizontal: 2,
    // backgroundColor: "lightgreen",
  },
});

export default styles;
