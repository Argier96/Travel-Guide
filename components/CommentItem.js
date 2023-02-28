import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useUser, useTag} from '../hooks';
import {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ListItem as RNEListItem, Button} from '@rneui/themed';
import {ListItemButtonGroup} from '@rneui/base/dist/ListItem/ListItem.ButtonGroup';
import {uploadsUrl} from '../utils';
import {useComment} from '../hooks';
import moment from 'moment';
import {COLORS, SIZES, SHADOWS} from '../theme';
import PropTypes from 'prop-types';

const CommentItem = ({navigation, singleComment}) => {
  const {getFilesByTag} = useTag();
  const {deleteComment} = useComment();
  const [avatar, setAvatar] = useState('https//:placekittens/180');
  const {getUserById} = useUser();
  const [commentOwner, setCommentOwner] = useState({username: 'fetching..'});
  const {user, commentUpdate, setCommentUpdate, update, setUpdate} =
    useContext(MainContext);

  const loadAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag(
        'avatar_' + singleComment.user_id
      );
      const avatar = avatarArray.pop().filename;
      setAvatar(uploadsUrl + avatar);
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
    console.log('Delete button pressed');
    try {
      Alert.alert('Delete', 'this comment', [
        {text: 'Cancel'},
        {
          text: 'OK',
          onPress: async () => {
            const token = await AsyncStorage.getItem('userToken');
            const response = await deleteComment(
              token,
              singleComment.comment_id
            );
            console.log('Response from delete comment', response);
            response && setCommentUpdate(commentUpdate + 1);
            Alert.alert('Deleted comment successfully');
          },
        },
      ]);
    } catch (error) {
      console.log('Error in deleting comment ', error);
    }
  };

  useEffect(() => {
    fetchCommentOwner();
    loadAvatar();
  }, []);
  const CommentCard = () => {
    return (
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image style={styles.profileImage} source={{uri: avatar}} />
          <View style={{marginLeft: 0}}>
            <Text style={styles.name}>{commentOwner.username}</Text>
            <Text style={styles.subtitle}>
              {moment(singleComment.time_added).fromNow()}
            </Text>
          </View>
        </View>
        <Text style={{marginLeft: 10}}>{singleComment.comment}</Text>
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
    borderRadius: 25,
    marginRight: 10,
    marginLeft: 1,
  },
  name: {fontWeight: '500', fontSize: 12},
  subtitle: {color: 'gray', fontSize: 9},
  icon: {marginLeft: 'auto'},
  // Body
  description: {paddingHorizontal: 10, lineHeight: 20, letterSpacing: 0.3},
});

{
  /**
  <RNEListItem.Swipeable
          containerStyle={{height: 60}}
          onPress={() => {
            navigation.navigate('Single', item);
          }}
          rightContent={() => (
            <ListItemButtonGroup
              buttons={buttons}
              containerStyle={{width: 100}}
              innerBorderStyle={{color: 'gray'}}
            ></ListItemButtonGroup>
          )}


          </RNEListItem.Swipeable>
        > */
}
