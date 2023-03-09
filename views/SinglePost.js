import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useRef} from 'react';
import {SHADOWS, SIZES} from '../theme';
import PropTypes from 'prop-types';
import {uploadsUrl} from '../utils';
import {useUser, useFavourite, useTag, useComment, useMedia} from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MainContext} from '../contexts/MainContext';
import moment from 'moment';
import {Divider, Icon} from '@rneui/themed';
import CommentForm from '../components/CommentForm';
import ListComment from '../components/ListComment';
import {Video} from 'expo-av';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {PopupMenu} from '../components';

const SinglePost = ({route, navigation}) => {
  const file = route.params;
  const videoRef = useRef(null);
  const {getUserById} = useUser();
  const {getFilesByTag} = useTag();
  const {deleteMedia} = useMedia();
  const {postFavourite, getFavouriteById, deleteFavourite} = useFavourite();
  const {user, commentUpdate, update, setUpdate, likeUpdate, setLikeUpdate} =
    useContext(MainContext);
  const [owner, setOwner] = useState({username: 'fetching..'});
  const [avatar, setAvatar] = useState(
    'https://via.placeholder.com/180&text=loading'
  );
  const [likes, setLikes] = useState([]);
  const [userLike, setUserLike] = useState(false);
  const {getCommentById} = useComment();
  const [comments, setComments] = useState([]);

  const [index, setIndex] = useState('none');
  const [eventName, setEventName] = useState('none');
  const [selectedOption, setSelectedOption] = useState('none');
  const options = ['Edit', 'Delete'];

  const fetchComments = async () => {
    try {
      const commentsData = await getCommentById(file.file_id);
      setComments(commentsData);
    } catch (e) {
      console.log('Error in fetching comments', e);
    }
  };
  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(file.user_id, token);
      setOwner(userData);
    } catch (e) {
      console.log('Error in fetching owner', e);
      setOwner({username: '[not available]'});
    }
  };
  const loadAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + file.user_id);
      if (avatarArray.length === 0) {
        return;
      }

      const avatar = avatarArray.pop().filename;
      setAvatar(uploadsUrl + avatar);
    } catch (error) {
      console.error('user avatar fetch failed', error.message);
    }
  };
  const fetchLikes = async () => {
    try {
      const likesData = await getFavouriteById(file.file_id);
      setLikes(likesData);
      likesData.forEach((like) => {
        like.user_id === user.user_id && setUserLike(true);
      });
    } catch (error) {
      console.error('fetchLikes() error', error);
    }
  };
  const createFavourite = async () => {
    try {
      // console.log('Create favourite called');
      const token = await AsyncStorage.getItem('userToken');
      await postFavourite(token, file.file_id);
      setUserLike(true);
      setLikeUpdate(likeUpdate + 1);
    } catch (error) {
      console.error('createFavourite error', error);
    }
  };
  const removeFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await deleteFavourite(token, file.file_id);
      response && setUserLike(false);
      setLikeUpdate(likeUpdate + 1);
    } catch (error) {
      console.error('removeFavourite error', error);
    }
  };
  const doDelete = () => {
    try {
      Alert.alert('Delete', ' this file permanently', [
        {
          text: 'Cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            const response = await deleteMedia(file.file_id, token);
            response && setUpdate(!update);
            Alert.alert('Post', 'deleted successfully');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error) {
      console.log('Error in deleting media', error);
    }
  };
  const goToEditPost = () => {
    console.log('Edit pressed');
    navigation.navigate('ModifyPost', file);
  };
  const onPopupEvent = (eventName, index, style) => {
    if (index >= 0) setSelectedOption(options[index]);
    setIndex(index);
    setEventName(eventName);
    console.log('Index: ' + index);

    if (index === 0) {
      // setIsEditPost(!isEditPost);
      goToEditPost();
    } else if (index === 1) doDelete();
  };

  useEffect(() => {
    fetchComments();
  }, [commentUpdate]);

  useEffect(() => {
    fetchOwner();
    loadAvatar();
  }, []);
  useEffect(() => {
    fetchLikes();
  }, [likeUpdate]);
  return (
    <SafeAreaView>
      <View style={styles.post}>
        <KeyboardAwareScrollView
          style={{flex: 1}}
          keyboardShouldPersistTaps="handled"
        >
          <ScrollView>
            <View style={styles.header}>
              <View style={{flexDirection: 'row'}}>
                <Image style={styles.profileImage} source={{uri: avatar}} />
                <View>
                  <Text style={styles.name}>{owner.username}</Text>
                  <Text style={styles.subtitle}>
                    {moment(file.time_added).fromNow()}
                  </Text>
                </View>
              </View>
              <View>
                {user.user_id === file.user_id && (
                  <PopupMenu options={options} onPress={onPopupEvent}>
                    <Icon
                      name="ellipsis-vertical"
                      type="ionicon"
                      raised
                      size={SIZES.large}
                      style={styles.icon}
                    />
                  </PopupMenu>
                )}
              </View>
            </View>
            {/* Fixme: Removed description temporarily to maintain comments styling */}
            {/* {file.description && (
              <Text style={styles.description}>{file.description}</Text>
            )}*/}
            <View
              style={{
                width: '97%',
                height: Platform.OS === 'android' ? 200 : 300,
              }}
            >
              {file.media_type === 'image' ? (
                <Image
                  style={styles.image}
                  source={{uri: uploadsUrl + file.filename}}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  ref={videoRef}
                  source={{uri: uploadsUrl + file.filename}}
                  style={styles.video}
                  resizeMode="cover"
                  useNativeControls
                  onError={(error) => {
                    console.log(error);
                  }}
                  isLooping
                />
              )}
            </View>
            <View style={{flexDirection: 'column'}}>
              <View style={styles.buttonsRow}>
                <View style={styles.iconButton}>
                  {userLike ? (
                    <Icon
                      name="heart"
                      type="material-community"
                      size={SIZES.extraLarge}
                      onPress={() => {
                        removeFavourite();
                      }}
                      color="red"
                    />
                  ) : (
                    <Icon
                      name="heart-outline"
                      type="ionicon"
                      size={SIZES.extraLarge}
                      onPress={() => {
                        createFavourite();
                        //fetchLikes();
                      }}
                    />
                  )}
                  <Text> {likes.length} likes</Text>
                </View>
                <View style={styles.iconButton}>
                  <Icon
                    name="chatbox-ellipses"
                    type="ionicon"
                    color="gray"
                    size={SIZES.extraLarge}
                  />
                  <Text style={styles.iconButtonText}>
                    {comments.length} comments
                  </Text>
                </View>
                <View style={styles.iconButton}>
                  <Icon
                    name="share-social-outline"
                    type="ionicon"
                    color="gray"
                    size={SIZES.extraLarge}
                  />
                  <Text style={styles.iconButtonText}>Share</Text>
                </View>
              </View>
              <Divider />
              <CommentForm fileId={file.file_id} />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <View style={{maxHeight: '40%', padding: 5}}>
          <ListComment navigation={navigation} fileId={file.file_id} />
        </View>
      </View>
    </SafeAreaView>
  );
};
SinglePost.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object,
};

export default SinglePost;
const styles = StyleSheet.create({
  post: {
    height: Platform.OS === 'android' ? 610 : 750,
    backgroundColor: '#E6EEFA',
    borderRadius: SIZES.font,
    marginBottom: SIZES.extraLarge,
    marginTop: Platform.OS === 'android' ? SIZES.medium : -20,
    margin: SIZES.base,
    ...SHADOWS.dark,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    marginTop: Platform.OS === 'android' ? 0 : 34,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: SIZES.extraLarge,
    marginRight: SIZES.small,
  },
  name: {fontWeight: '500'},
  subtitle: {color: 'gray'},
  icon: {marginLeft: 'auto'},

  // Dialog container
  dialogBox: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    elevation: SIZES.base,
    position: 'absolute',
    top: Platform.OS === 'android' ? 80 : 100,
    left: Platform.OS === 'android' ? 200 : 220,
  },
  dialogItemEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
    backgroundColor: '#9acf9b',
    height: 30,
    width: 80,
    padding: 5,
  },
  dialogItemDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f96e6e',
    height: 30,
    width: 80,
    padding: 5,
  },
  // Body
  description: {
    paddingHorizontal: 10,
    lineHeight: SIZES.large,
    letterSpacing: 0.3,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.font,
    margin: 5,
  },
  video: {
    width: '100%',
    height: '100%',
    margin: 5,
  },
  buttonsRow: {
    marginVertical: SIZES.base,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonText: {marginLeft: 5, color: 'gray', fontWeight: '500'},
});
