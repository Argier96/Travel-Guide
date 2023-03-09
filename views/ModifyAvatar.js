import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  Text,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useContext, useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {MainContext} from '../contexts/MainContext';
import * as ImagePicker from 'expo-image-picker';
import {useMedia, useTag} from '../hooks';
import PropTypes from 'prop-types';
import {Card, Button, Icon, Avatar} from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {COLORS, SIZES} from '../theme';
import {uploadsUrl} from '../utils';

const ModifyAvatar = ({navigation}) => {
  const [mediafile, setMediafile] = useState({});
  const [avatar, setAvatar] = useState(
    'https://via.placeholder.com/180&text=loading'
  );
  const {getFilesByTag} = useTag();
  const [loading, setLoading] = useState(false);
  const {update, setUpdate, user} = useContext(MainContext);
  const {postMedia} = useMedia();
  const {postTag} = useTag();

  const {reset} = useForm({
    defaultValues: {},
    mode: 'onChange',
  });
  const loadAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + user.user_id);
      // console.log(avatarArray);
      const avatar = avatarArray.pop().filename;
      // setLoading(true);
      setAvatar(uploadsUrl + avatar);
    } catch (error) {
      console.error('user avatar fetch failed', error.message);
    }
  };
  useEffect(() => {
    loadAvatar();
  }, []);
  const postAvatar = async () => {
    setLoading(true);
    const formData = new FormData();
    // console.log('MEdia file post Avatar', mediafile);
    const filename = mediafile.uri.split('/').pop();
    let fileExt = filename.split('.').pop();
    if (fileExt === 'jpg') fileExt = 'jpeg';
    const mimeType = mediafile.type + '/' + fileExt;
    formData.append('file', {
      uri: mediafile.uri,
      name: filename,
      type: mimeType,
    });
    // console.log('form data', formData);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const result = await postMedia(formData, token);
      console.log('upload result', result);
      const appTag = {file_id: result.file_id, tag: 'avatar_' + user.user_id};
      const tagResult = await postTag(appTag, token);
      console.log('Tag result', tagResult);
      Alert.alert('Uploaded file successfully');
      setUpdate(!update);
      navigation.navigate('Profile');
    } catch (error) {
      console.error('file upload failed', error);
    } finally {
      setLoading(false);
    }
  };
  const getCameraPermission = async () => {
    const {status} = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera permission');
    }
  };

  const takePicture = async () => {
    // No permissions request is necessary for launching the image library
    try {
      await getCameraPermission();
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log('Pick camera result', result);

      if (!result.canceled) {
        setMediafile(result.assets[0]);
      }
    } catch (error) {
      console.log('Error in taking picture', error);
    }
  };

  const pickFile = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setMediafile(result.assets[0]);
    }
  };

  const resetForm = () => {
    setMediafile({});
    reset();
  };
  useFocusEffect(
    useCallback(() => {
      return () => {
        resetForm();
      };
    }, [])
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          margin: SIZES.large,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: SIZES.xxl,
        }}
      >
        <Avatar rounded source={{uri: avatar}} size="large" />
        <Text style={{fontSize: SIZES.large, marginLeft: 5}}>
          {user.username}
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => Keyboard.dismiss()} activeOpacity={1}>
          <Card>
            <Card.Image
              containerStyle={{borderRadius: SIZES.extraLarge}}
              source={{
                uri:
                  mediafile.uri ||
                  'https://place-hold.it/200x300&text=choose-avatar',
              }}
              onPress={pickFile}
            />

            <View style={styles.btnContainer}>
              <Button
                buttonStyle={styles.btnWithIcon}
                icon={
                  <Icon
                    name="image"
                    type="ionicon"
                    size={SIZES.extraLarge}
                    color="white"
                  />
                }
                title=" Gallery"
                onPress={pickFile}
              />
              <Button
                buttonStyle={styles.btnWithIcon}
                icon={
                  <Icon
                    name="camera"
                    type="ionicon"
                    size={SIZES.extraLarge}
                    color="white"
                  />
                }
                title="Camera"
                onPress={takePicture}
              />
            </View>
            <Button
              disabled={!mediafile.uri}
              title="Upload Avatar"
              onPress={postAvatar}
              loading={loading}
              buttonStyle={styles.btnwithoutIcon}
            />
            <Button
              buttonStyle={styles.btnwithoutIcon}
              title="Cancel"
              onPress={resetForm}
              type="outline"
            />
            {loading && <ActivityIndicator size="large" />}
          </Card>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

ModifyAvatar.propTypes = {
  navigation: PropTypes.object,
};

export default ModifyAvatar;
const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: SIZES.font,
  },
  btnwithoutIcon: {borderRadius: SIZES.extraLarge, margin: SIZES.base},
  btnWithIcon: {
    borderRadius: SIZES.extraLarge,
    width: 105,
    backgroundColor: 'rgba(78, 116, 289, 1)',
  },
  // lowercard background
  lowerCard: {
    height: 300,
    backgroundColor: COLORS.white,
  },

  // uppercard for background
  upperCard: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});
