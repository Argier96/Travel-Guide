import {StyleSheet, Text, View, Pressable, Alert} from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import {useFavourite, useUser} from '../hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {uploadsUrl} from '../utils';
import {Image, Icon} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import {MainContext} from '../contexts/MainContext';
import PropTypes from 'prop-types';
import moment from 'moment';
import {COLORS, SIZES, SHADOWS} from '../theme';
import UserAvatar from '../components/UserAvatar';

const FavItem = ({singleItem}) => {
  const navigation = useNavigation();
  const {getUserById} = useUser();
  const {update, setUpdate} = useContext(MainContext);
  const [owner, setOwner] = useState({username: 'fetching..'});
  const [userLike, setUserLike] = useState(false);
  const {deleteFavourite} = useFavourite();

  const removeFavourite = async () => {
    Alert.alert('Are you sure', 'to remove it from favourite?', [
      {text: 'Cancel'},
      {
        text: 'Ok',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await deleteFavourite(token, singleItem.file_id);
            response && setUserLike(false);
            setUpdate(!update);
          } catch (error) {
            console.error('removeFavourite error', error);
          }
        },
      },
    ]);
  };
  const fetchOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(singleItem.user_id, token);
      setOwner(userData);
    } catch (e) {
      console.log('Error in fetching owner', e);
      setOwner({username: '[not available]'});
    }
  };
  useEffect(() => {
    fetchOwner();
  }, [update]);
  return (
    <Pressable onPress={() => navigation.navigate('SinglePost', singleItem)}>
      <View>
        <View style={styles.post}>
          <View style={styles.header}>
            <View style={{flexDirection: 'row'}}>
              <UserAvatar userId={singleItem.user_id} />
              <View>
                <Text style={styles.name}>{owner.username}</Text>
                <Text style={styles.subtitle}>
                  {moment(singleItem.time_added).fromNow()}
                </Text>
              </View>
            </View>
          </View>
          {singleItem.description && (
            <Text style={styles.description}>{singleItem.description}</Text>
          )}
          <View style={{width: '98%', height: 250}}>
            {singleItem.media_type === 'image' ? (
              <Image
                style={styles.image}
                source={{uri: uploadsUrl + singleItem.filename}}
                resizeMode="cover"
              >
                <Icon
                  name="heart-circle-outline"
                  type="ionicon"
                  size={SIZES.xxl}
                  color="red"
                  containerStyle={styles.iconImage}
                  onPress={() => {
                    removeFavourite();
                    console.log('Removed form favourite');
                  }}
                />
              </Image>
            ) : (
              <Image
                style={styles.image}
                source={{uri: uploadsUrl + singleItem.screenshot}}
                resizeMode="cover"
              >
                <Icon
                  name="heart-circle-outline"
                  type="ionicon"
                  size={SIZES.xxl}
                  color="red"
                  containerStyle={styles.iconImage}
                  onPress={() => {
                    removeFavourite();
                    console.log('Removed form favourite');
                  }}
                />
              </Image>
            )}
          </View>
          <View style={styles.footer}>
            <View style={styles.statsRow}></View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

FavItem.propTypes = {
  singleItem: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};
export default FavItem;

const styles = StyleSheet.create({
  post: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.font,
    marginBottom: SIZES.extraLarge,
    height: 350,
    margin: SIZES.base,
    ...SHADOWS.dark,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.small,
  },

  name: {fontWeight: '500'},
  subtitle: {color: 'gray'},
  icon: {marginLeft: 'auto'},
  // Body
  description: {paddingHorizontal: 10, lineHeight: 20, letterSpacing: 0.3},

  iconImage: {
    position: 'absolute',
    top: SIZES.medium,
    right: SIZES.medium,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: SIZES.font,
    margin: 5,
  },

  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButtonText: {marginLeft: 5, color: 'gray', fontWeight: '500'},
});
