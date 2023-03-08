import {StyleSheet, Image, View} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useTag} from '../hooks';
import {uploadsUrl} from '../utils';
import PropTypes from 'prop-types';
import {SIZES, assets} from '../theme';
import {MainContext} from '../contexts/MainContext';

const UserAvatar = ({userId}) => {
  const {isAvatarUpdated} = useContext(MainContext);
  const {getFilesByTag} = useTag();
  const [avatar, setAvatar] = useState('http://placekitten.com/640');

  const loadAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + userId);
      const avatar = avatarArray ? avatarArray.pop().filename : undefined;
      setAvatar(uploadsUrl + avatar);
    } catch (error) {
      console.error('user avatar fetch failed', error.message);
    }
  };

  useEffect(() => {
    loadAvatar();
  }, [isAvatarUpdated]);
  return (
    <View style={styles.userAvatarContainer}>
      <Image style={styles.profileImage} source={{uri: avatar}} />
      <Image
        source={assets.badge}
        resizeMode="contain"
        style={styles.avatarBadge}
      />
    </View>
  );
};
UserAvatar.propTypes = {
  userId: PropTypes.number,
};
export default UserAvatar;

const styles = StyleSheet.create({
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  userAvatarContainer: {width: 45, height: 45, marginRight: 10},
  userAvatar: {width: '100%', height: '100%', borderRadius: 25},
  avatarBadge: {
    position: 'absolute',
    width: SIZES.font,
    height: SIZES.font,
    bottom: 0,
    right: 0,
  },
});
