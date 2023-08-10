import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  root: {
    margin: 10,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#dedede",
    padding: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  input: {
    marginHorizontal: 5,
    fontSize: 16,
    flex: 1,
  },
  icons: {
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: 45,
    height: 45,
    backgroundColor: "#3777f0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 35,
  },
  sendImageContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 10,
  },
  innerContainer: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  sendAudioContainer: {
    marginVertical: 10,
  },
  audioInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 10,
  },
});

export default styles;
