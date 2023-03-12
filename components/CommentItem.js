import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useUser, useTag} from '../hooks';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {uploadsUrl} from '../utils';
import {useComment} from '../hooks';
import moment from 'moment';
import {SHADOWS, SIZES} from '../theme';
import PropTypes from 'prop-types';
import PopupMenu from './PopupMenu';

const CommentItem = ({navigation, singleComment}) => {
  const {getFilesByTag} = useTag();
  const {deleteComment} = useComment();
  const [avatar, setAvatar] = useState(
    'https://via.placeholder.com/180&text=loading'
  );
  const {getUserById} = useUser();
  const [commentOwner, setCommentOwner] = useState({username: 'loading..'});
  const {
    user,
    commentUpdate,
    setCommentUpdate,
    isAvatarUpdated,
    isNotification,
    setIsNotification,
    setNotification,
  } = useContext(MainContext);
  const [index, setIndex] = useState('none');
  const [eventName, setEventName] = useState('none');
  const [selectedOption, setSelectedOption] = useState('none');
  const options = ['Edit', 'Delete'];
  const [tag, setTag] = useState({});
  const [isEditComment, setIsEditComment] = useState(false);

  const onPopupEvent = (eventName, index) => {
    if (index >= 0) setSelectedOption(options[index]);
    setIndex(index);
    setEventName(eventName);
    if (index === 0) setIsEditComment(!isEditComment);
    else if (index === 1) doDeleteComment();
  };
  const loadAvatar = async () => {
    try {
      await getFilesByTag('avatar_' + singleComment.user_id).then(
        (tagArray) => {
          if (tagArray.length === 0) {
            setAvatar(
              'https://cdn3.iconfinder.com/data/icons/web-design-and-development-2-6/512/87-1024.png'
            );
          } else {
            setTag(tagArray[0]);
            setAvatar(uploadsUrl + tagArray.pop().filename);
          }
        }
      );
    } catch (error) {
      console.error('user avatar fetch failed', error.message);
    }
  };
  const fetchCommentOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(singleComment.user_id, token);
      setCommentOwner(userData);
    } catch (e) {
      console.log('Error in fetching comment owner', e);
      setCommentOwner({username: '[not available]'});
    }
  };

  const doDeleteComment = async () => {
    try {
      setNotification({
        type: 'info',
        title: 'Delete comment?',
        message: 'Are you sure?',
        isOkButton: true,
        isCancelButton: true,
        onOkClick: async function () {
          setIsNotification(false);
          try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await deleteComment(
              token,
              singleComment.comment_id
            );
            console.log('Response from delete comment', response);
            if (response) {
              setCommentUpdate(!commentUpdate);
              setNotification({
                type: 'success',
                title: 'Comment deleted successfully',
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
      console.error('Error in deleting comment ', error);
    }
  };
  const formatTimeAgo = (dateTime) => {
    const now = moment();
    const then = moment(dateTime);
    const duration = moment.duration(now.diff(then));
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    let unit = '';
    let value = '';

    if (days > 0) {
      unit = 'd';
      value = days;
    } else if (hours > 0) {
      unit = 'h';
      value = hours;
    } else if (minutes > 0) {
      unit = 'm';
      value = minutes;
    } else {
      unit = 's';
      value = seconds;
    }

    return `${value}${unit} ago`;
  };

  useEffect(() => {
    fetchCommentOwner();
  }, []);
  useEffect(() => {
    loadAvatar();
  }, [isAvatarUpdated]);

  const CommentCard = () => {
    return (
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={styles.profileImage} source={{uri: avatar}} />
          <View style={{marginLeft: 0}}>
            <Text style={styles.name}>{commentOwner.username}</Text>
            <Text style={styles.subtitle}>
              {formatTimeAgo(singleComment.time_added)}
            </Text>
          </View>
        </View>
        <View style={styles.commentContainer}>
          {user.user_id === singleComment.user_id ? (
            <PopupMenu options={options} onPress={onPopupEvent}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={2}
                style={{marginLeft: SIZES.small}}
              >
                {singleComment.comment}
              </Text>
            </PopupMenu>
          ) : (
            <Text
              ellipsizeMode="tail"
              numberOfLines={2}
              style={{marginLeft: SIZES.small}}
            >
              {singleComment.comment}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.post}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <CommentCard />
      </View>
    </View>
  );
};
CommentItem.propTypes = {
  singleComment: PropTypes.object.isRequired,
  navigation: PropTypes.object,
};

export default CommentItem;
const styles = StyleSheet.create({
  cardContainer: {},
  post: {
    height: 50,
    backgroundColor: '#E6EEFA',
    margin: 1,
    ...SHADOWS.dark,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: SIZES.extraLarge,
    marginRight: SIZES.small,
    marginLeft: 1,
  },
  name: {fontWeight: '500', fontSize: SIZES.small},
  subtitle: {color: 'gray', fontSize: 9},
  icon: {marginLeft: 'auto'},
  // Body
  description: {paddingHorizontal: 10, lineHeight: 20, letterSpacing: 0.3},
  commentContainer: {
    flex: 1,
    alignContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 5,
  },
});
