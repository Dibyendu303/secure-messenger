import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import prettyMilliseconds from "pretty-ms";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { AVPlaybackStatus, Audio } from "expo-av";

interface IAudioPlayerProps {
  recordingUri: string;
}

const AudioPlayer = ({ recordingUri }: IAudioPlayerProps) => {
  const [audioProgress, setAudioProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [paused, setPaused] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState(0);

  useEffect(() => {
    loadSound();
    () => {
      // unload sound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [recordingUri]);

  const loadSound = async () => {
    if (!recordingUri) {
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        {},
        onPlayBackStatusUpdate
      );
      setSound(sound);
    } catch (e) {
      console.log("Error in creating sound from recording.");
      console.log(e);
    }
  };

  const onPlayBackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setAudioProgress(status.positionMillis / (status.durationMillis || 1));
    setPaused(!status.isPlaying);
    setAudioDuration(status.durationMillis || 0);
  };

  const getDuration = () => {
    return prettyMilliseconds(audioDuration);
  };

  const playPauseSound = () => {
    if (!sound) return;
    if (paused) {
      sound.playAsync();
    } else {
      sound.pauseAsync();
    }
  };

  const replaySound = () => {
    if (!sound) return;
    sound.playFromPositionAsync(0);
  };

  return (
    <View style={styles.audioContainer}>
      {sound ? (
        <>
          {audioProgress === 1 ? (
            <Pressable onPress={replaySound}>
              <FontAwesome name="repeat" size={24} color="#595959" />
            </Pressable>
          ) : (
            <Pressable onPress={playPauseSound}>
              <Feather
                name={paused ? "play" : "pause"}
                size={24}
                color="#595959"
              />
            </Pressable>
          )}
          <View style={styles.audioProgressBarContainer}>
            <View style={styles.audioProgressBar}>
              <View
                style={[
                  styles.audioProgressBarCircle,
                  { left: `${audioProgress * 100}%` },
                ]}
              ></View>
            </View>
          </View>
          <View style={{ marginHorizontal: 10 }}>
            <Text>{getDuration()}</Text>
          </View>
        </>
      ) : (
        <View style={{ flexDirection: "row" }}>
          <ActivityIndicator color={"#3777f0"} />
          <Text style={{ marginLeft: 10, color: "grey" }}>Loading Audio</Text>
        </View>
      )}
    </View>
  );
};

export default AudioPlayer;
