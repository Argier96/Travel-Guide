import {StyleSheet, View, Text, Image} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import {useRef} from 'react';
import {SHADOWS, SIZES} from '../theme';
import PropTypes from 'prop-types';
import {uploadsUrl} from '../utils';
import {useUser, useFavourite, useTag, useComment} from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {MainContext} from '../contexts/MainContext';
import moment from 'moment';
import {Divider, Icon} from '@rneui/themed';
import CommentForm from '../components/CommentForm';
import ListComment from '../components/ListComment';
import {Video} from 'expo-av';
import {Platform} from 'react-native';

const SinglePost = ({route, navigation}) => {
  const file = route.params;
  // console.log('File', file);
  const video = useRef(null);
  const {getUserById} = useUser();
  const {getFilesByTag} = useTag();
  const {postFavourite, getFavouriteById, deleteFavourite} = useFavourite();
  const {user, commentUpdate} = useContext(MainContext);
  const [owner, setOwner] = useState({username: 'fetching..'});
  const [avatar, setAvatar] = useState('https//:placekittens/180');
  const [likes, setLikes] = useState([]);
  const [userLike, setUserLike] = useState(false);
  const {getCommentById} = useComment();
  const [comments, setComments] = useState([]);

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
      // console.log(avatarArray);
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
      // console.log('Response from create Fav', response);
      setUserLike(true);
    } catch (error) {
      console.error('createFavourite error', error);
    }
  };
  const removeFavourite = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await deleteFavourite(token, file.file_id);
      response && setUserLike(false);
    } catch (error) {
      console.error('removeFavourite error', error);
    }
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
  }, [userLike]);
  return (
    <>
      <View>
        <View style={styles.post}>
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
            <Icon
              name="ellipsis-vertical"
              type="ionicon"
              size={20}
              style={styles.icon}
            />
          </View>
          {file.description && (
            <Text style={styles.description}>{file.description}</Text>
          )}
          <View style={{width: '97%', height: 200}}>
            {file.media_type === 'image' ? (
              <Image
                style={styles.image}
                source={{uri: uploadsUrl + file.filename}}
                resizeMode="cover"
              />
            ) : (
              <Video
                ref={video}
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
                    size={25}
                    onPress={() => {
                      removeFavourite();
                    }}
                    color="red"
                  />
                ) : (
                  <Icon
                    name="heart-outline"
                    type="ionicon"
                    size={25}
                    onPress={() => {
                      createFavourite();
                      fetchLikes();
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
                  size={23}
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
                  size={23}
                />
                <Text style={styles.iconButtonText}>Share</Text>
              </View>
            </View>
            <Divider />
            <CommentForm fileId={file.file_id} />
          </View>
          <View style={{padding: 5, marginBottom: 30}}>
            <ListComment navigation={navigation} fileId={file.file_id} />
          </View>
        </View>
      </View>
    </>
  );
};
SinglePost.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object,
};

export default SinglePost;
const styles = StyleSheet.create({
  post: {
    height: Platform.OS === 'android' ? 610 : 710,
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
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {fontWeight: '500'},
  subtitle: {color: 'gray'},
  icon: {marginLeft: 'auto'},
  // Body
  description: {paddingHorizontal: 10, lineHeight: 20, letterSpacing: 0.3},

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
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonText: {marginLeft: 5, color: 'gray', fontWeight: '500'},
});
