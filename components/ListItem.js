import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {uploadsUrl} from '../utils';
import {COLORS, SHADOWS, SIZES} from '../theme';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Badge, Icon} from '@rneui/themed';
import moment from 'moment';
import {PopupMenu} from './';
import {useComment, useFavourite, useMedia, useUser} from '../hooks';
import PropTypes from 'prop-types';
import {Video} from 'expo-av';
import UserAvatar from './UserAvatar';

const ListItem = ({navigation, singleMedia, myFilesOnly}) => {
  const {deleteMedia} = useMedia();
  const {
    update,
    setUpdate,
    user,
    isEditPost,
    setIsEditPost,
    commentUpdate,
    likeUpdate,
    setLikeUpdate,
    isUserUpdate,
    isNotification,
    setIsNotification,
    setNotification,
  } = useContext(MainContext);

  const {postFavourite, getFavouriteById, deleteFavourite} = useFavourite();
  const {getUserById} = useUser();

  const [owner, setOwner] = useState({username: 'fetching..'});
  const video = useRef(null);

  const [likes, setLikes] = useState([]);
  const [userLike, setUserLike] = useState(false);
  const [index, setIndex] = useState('none');
  const [eventName, setEventName] = useState('none');
  const [selectedOption, setSelectedOption] = useState('none');
  const {getCommentById} = useComment();
  const [comments, setComments] = useState([]);
  const options = ['Edit', 'Delete'];

  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(singleMedia.user_id, token);
      setOwner(userData);
    } catch (e) {
      console.error('Error in fetching owner', e);
      setOwner({username: '[not available]'});
    }
  };
  const fetchComments = async () => {
    try {
      const commentsData = await getCommentById(singleMedia.file_id);
      setComments(commentsData);
    } catch (e) {
      console.error('Error in fetching comments', e);
    }
  };

  const getMediaLikes = async () => {
    setUserLike(false);
    try {
      await getFavouriteById(singleMedia.file_id).then((likes) => {
        setLikes(likes);
        for (const like of likes) {
          if (like.user_id === user.user_id) {
            setUserLike(true);
            break;
          }
        }
      });
    } catch (error) {
      console.error('fetchLikes() error', error);
    }
  };

  const createFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await postFavourite(token, singleMedia.file_id);
      response && setLikeUpdate(!likeUpdate);
    } catch (error) {
      console.error('createFavourite error', error);
    }
  };

  const removeFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await deleteFavourite(token, singleMedia.file_id);
      response && setLikeUpdate(!likeUpdate);
    } catch (error) {
      console.error('removeFavourite error', error);
    }
  };

  const handleFavourites = () => {
    if (userLike) {
      removeFavourite();
    } else {
      createFavourite();
    }
  };

  useEffect(() => {
    fetchOwner();
  }, [isUserUpdate]);

  useEffect(() => {
    getMediaLikes();
  }, [likeUpdate]);

  useEffect(() => {
    fetchComments();
  }, [commentUpdate]);
  const doDelete = () => {
    try {
      setNotification({
        type: 'info',
        title: 'Delete file?',
        message: 'Are you sure?',
        isOkButton: true,
        isCancelButton: true,
        onOkClick: async function () {
          setIsNotification(false);
          try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await deleteMedia(singleMedia.file_id, token);
            if (response) {
              setUpdate(!update);
              setNotification({
                type: 'success',
                title: 'File deleted successfully',
                message: '',
              });
              setIsNotification(!isNotification);
            }
          } catch (error) {
            console.error('Async Storage error: ' + error.message);
          }
        },
        onCancelClick: async function () {
          setIsNotification(false);
        },
      });
      setIsNotification(!isNotification);
    } catch (error) {
      console.error('Error in deleting media ', error);
    }
  };

  const goToEditPost = () => {
    navigation.navigate('ModifyPost', singleMedia);
  };
  const onPopupEvent = (eventName, index, style) => {
    if (index >= 0) setSelectedOption(options[index]);
    setIndex(index);
    setEventName(eventName);
    if (index === 0) {
      setIsEditPost(!isEditPost);
      goToEditPost();
    } else if (index === 1) doDelete();
  };

  return (
    <View style={styles.post}>
      <Pressable style={styles.header}>
        <View style={{flexDirection: 'row'}}>
          {user.user_id !== singleMedia.user_id ? (
            <Pressable
              onPress={() => {
                navigation.navigate('OtherUserProfile', {file: singleMedia});
              }}
            >
              <UserAvatar userId={singleMedia.user_id} />
            </Pressable>
          ) : (
            <UserAvatar userId={singleMedia.user_id} />
          )}
          <View>
            <Text style={styles.name}>{owner.username}</Text>
            <Text style={styles.subtitle}>
              {moment(singleMedia.time_added).fromNow()}
            </Text>
          </View>
        </View>

        <View>
          {user.user_id === singleMedia.user_id && (
            <PopupMenu options={options} onPress={onPopupEvent}>
              <Icon
                name="ellipsis-vertical"
                type="ionicon"
                raised
                size={20}
                style={styles.icon}
              />
            </PopupMenu>
          )}
        </View>
      </Pressable>
      {singleMedia.description && (
        <Text style={styles.description}>{singleMedia.description}</Text>
      )}
      <Pressable
        onPress={() => {
          navigation.navigate('SinglePost', singleMedia);
        }}
      >
        <View style={styles.feedImageContainer}>
          {singleMedia.media_type === 'image' ? (
            <Image
              style={styles.image}
              source={{uri: uploadsUrl + singleMedia.filename}}
            />
          ) : (
            <Video
              ref={video}
              source={{uri: uploadsUrl + singleMedia.filename}}
              style={{width: '100%', height: 250}}
              resizeMode="cover"
              useNativeControls
              onError={(error) => {
                console.error(error);
              }}
              isLooping
            />
          )}
          <View
            style={{
              flexDirection: 'column',
              position: 'absolute',
              top: '60%',
              left: '86%',
            }}
          >
            <View>
              <Icon
                size={16}
                solid
                color={COLORS.primary}
                raised
                reverse={likes.length === 0}
                name="heart"
                type="font-awesome"
                onPress={() => {
                  navigation.navigate('LikedBy', {file: singleMedia});
                }}
              />
              {likes.length === 0 ? (
                <></>
              ) : (
                <Badge
                  status="error"
                  value={likes.length}
                  containerStyle={{
                    position: 'absolute',
                    left: 32,
                  }}
                />
              )}
            </View>
            <View>
              <Icon
                size={16}
                solid
                color={COLORS.primary}
                raised
                reverse={comments.length === 0}
                name="chatbox-ellipses-outline"
                type="ionicon"
                // TODO point to proper navigation
                onPress={() => {
                  navigation.navigate('CommentedBy', {file: singleMedia});
                }}
                // onPress={toggleMediaLike}
              />
              {comments.length === 0 ? (
                <></>
              ) : (
                <Badge
                  status="error"
                  value={comments.length}
                  containerStyle={{
                    position: 'absolute',
                    left: 32,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View>
            <Icon
              size={16}
              solid
              raised
              name={userLike ? 'dislike' : 'like'}
              type="simple-line-icon"
              onPress={() => handleFavourites()}
            />
          </View>
          <View>
            <Icon
              size={16}
              solid
              raised
              name="chatbox-ellipses"
              type="ionicon"
              onPress={() => {
                navigation.navigate('SinglePost', singleMedia);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

ListItem.propTypes = {
  singleMedia: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};

export default ListItem;

const styles = StyleSheet.create({
  post: {
    backgroundColor: '#E6EEFA',
    borderRadius: SIZES.font,
    marginBottom: SIZES.extraLarge,
    margin: SIZES.base,
    ...SHADOWS.dark,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    padding: 10,
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {fontWeight: '500'},
  subtitle: {color: 'gray'},
  icon: {marginLeft: 'auto'},
  commentInfo: {color: 'gray', marginLeft: 5},
  userAvatarContainer: {width: 45, height: 45, marginRight: 10},
  userAvatar: {width: '100%', height: '100%', borderRadius: 25},
  avatarBadge: {
    position: 'absolute',
    width: SIZES.font,
    height: SIZES.font,
    bottom: 0,
    right: 0,
  },

  // Dialog container
  dialogBox: {
    width: 110,
    height: 125,
    elevation: SIZES.base,
    position: 'absolute',
    top: 80,
    left: 200,
    borderRadius: SIZES.extraLarge,
  },
  dialogItemEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
    backgroundColor: '#07b37f',
    height: 40,
    borderRadius: SIZES.font,
  },
  dialogItemDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2132d',
    height: 40,
    borderRadius: SIZES.font,
  },
  // Body
  description: {paddingHorizontal: 10, lineHeight: 20, letterSpacing: 0.3},

  image: {
    width: '100%',
    height: '100%',
    // borderRadius: SIZES.font,
    marginTop: 5,
  },
  feedImageContainer: {width: '100%', height: 250},
  // Footer
  footer: {paddingHorizontal: 10},
  statsRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'lightgray',
  },
  likeIcon: {width: 20, height: 20, marginRight: 5},
  likedBy: {color: 'gray'},
  shares: {
    marginLeft: 'auto',
    color: 'gray',
  },
  // Buttons Row
  buttonsRow: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButtonText: {marginLeft: 5, color: 'gray', fontWeight: '500'},
});
