import {Button, Card, Input, Icon} from '@rneui/themed';
import PropTypes from 'prop-types';
import {Controller, useForm} from 'react-hook-form';
import {
  Alert,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useContext, useState, useCallback, useRef} from 'react';
import {useMedia, useTag} from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MainContext} from '../contexts/MainContext';
import {useFocusEffect} from '@react-navigation/native';
import {appId} from '../utils';
import {Video} from 'expo-av';
import {COLORS} from '../theme';

const NewPost = ({navigation}) => {
  const video = useRef(null);
  const [mediafile, setMediafile] = useState({});
  const [loading, setLoading] = useState(false);
  const {postMedia} = useMedia();
  const {postTag} = useTag();
  const {update, setUpdate} = useContext(MainContext);
  const {
    control,
    handleSubmit,
    trigger,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {title: '', description: ''},
    mode: 'onChange',
  });

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
        trigger();
      }
    } catch (error) {
      console.log('Error in taking picture', error);
    }
  };
  const uploadFile = async (data) => {
    // create form data and post it
    setLoading(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    const filename = mediafile.uri.split('/').pop();
    let fileExt = filename.split('.').pop();
    if (fileExt === 'jpg') fileExt = 'jpeg';
    const mimeType = mediafile.type + '/' + fileExt;
    formData.append('file', {
      uri: mediafile.uri,
      name: filename,
      type: mimeType,
    });
    console.log('form data', formData);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const result = await postMedia(formData, token);
      console.log('upload result', result);
      const appTag = {file_id: result.file_id, tag: appId};
      const tagResult = await postTag(appTag, token);
      console.log('Tag result', tagResult);
      Alert.alert('Uploaded', 'File id: ' + result.file_id, [
        {
          text: 'OK',
          onPress: () => {
            console.log('OK Pressed');
            // update 'update' state in context
            setUpdate(!update);
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.error('file upload failed', error);
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    // No permissions request is necessary for launching the image library
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log('Pick file result', result);

      if (!result.canceled) {
        setMediafile(result.assets[0]);
        trigger();
      }
    } catch (error) {
      console.log('Error in pick file', error);
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
    <ScrollView>
      <TouchableOpacity onPress={() => Keyboard.dismiss()} activeOpacity={1}>
        <Card>
          {mediafile.type === 'video' ? (
            <Video
              ref={video}
              source={{uri: mediafile.uri}}
              style={{width: '100%', height: 200}}
              resizeMode="contain"
              useNativeControls
              isLooping
              onError={(error) => {
                console.log(error);
              }}
            />
          ) : (
            <Card.Image
              source={{
                uri:
                  mediafile.uri || 'https://place-hold.it/200x300&text=choose',
              }}
              onPress={pickFile}
            />
          )}

          <Controller
            control={control}
            rules={{
              required: {value: true, message: 'This is required.'},
              minLength: {
                value: 3,
                message: 'Title min length is 3 characters.',
              },
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                placeholder="Title"
                multiline
                numberOfLines={2}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.title && errors.title.message}
              />
            )}
            name="title"
          />
          <Controller
            control={control}
            rules={{
              minLength: {
                value: 3,
                message: 'Description min length is 5 characters.',
              },
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                placeholder="Description"
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.description && errors.description.message}
              />
            )}
            name="description"
          />
          <View style={styles.btnContainer}>
            <Button
              buttonStyle={styles.btnWithIcon}
              icon={
                <Icon name="image" type="ionicon" size={25} color="white" />
              }
              title=" Gallery"
              onPress={pickFile}
            />
            <Button
              buttonStyle={styles.btnWithIcon}
              icon={
                <Icon name="camera" type="ionicon" size={25} color="white" />
              }
              title="Camera"
              onPress={takePicture}
            />
          </View>
          <Button
            disabled={!mediafile.uri || errors.title || errors.description}
            title="Upload"
            onPress={handleSubmit(uploadFile)}
            loading={loading}
            buttonStyle={{borderRadius: 25, margin: 8}}
          />
          <Button
            buttonStyle={styles.btnwithoutIcon}
            title="Reset"
            onPress={resetForm}
            type="outline"
          />
        </Card>
      </TouchableOpacity>
    </ScrollView>
  );
};

NewPost.propTypes = {
  navigation: PropTypes.object,
};

export default NewPost;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  btnwithoutIcon: {borderRadius: 25, margin: 8},
  btnWithIcon: {
    borderRadius: 25,
    width: 105,
    backgroundColor: COLORS.primary,
  },
});
