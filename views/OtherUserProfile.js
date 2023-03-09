import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {Avatar} from '@rneui/themed';
import {Text, Divider} from '@rneui/themed';
import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTag, useUser, useMedia, useFavourite} from '../hooks';
import {uploadsUrl} from '../utils';
import PropTypes from 'prop-types';
import {ProfileMediaCard} from '../components';
import MasonryList from '@react-native-seoul/masonry-list';
import {SIZES, COLORS} from '../theme';

const OtherUserProfile = ({navigation, route}) => {
  const {file} = route.params;
  const [userFiles, setUserFiles] = useState([]);
  const [avatar, setAvatar] = useState(
    'https://via.placeholder.com/180&text=loading'
  );
  const {getFilesByTag} = useTag();
  const {getUserById} = useUser();
  const {getAllFilesOfUser} = useMedia();
  const {getOtherUserFavorites} = useFavourite();
  const [profileOwner, setProfileOwner] = useState({username: 'fetching...'});
  const [noOfFavorites, setNoOfFavorites] = useState(0);

  const fetchAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + file.user_id);
      console.log('Avatar array: ', avatarArray);
      const avatar = avatarArray.pop().filename;
      setAvatar(uploadsUrl + avatar);
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchProfileOwner = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await getUserById(file.user_id, token);
      setProfileOwner(userData);
    } catch (e) {
      console.log('Error in fetching like owner', e);
      setProfileOwner({username: '[not available]'});
    }
  };

  const fetchUserFiles = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userFiles = await getAllFilesOfUser(file.user_id, token);
      console.log('Files of the user', userFiles);
      setUserFiles(userFiles);
    } catch (error) {
      console.log('Error in fetching like owner', error);
    }
  };

  const getOtherUserFavoritesCount = async () => {
    try {
      setNoOfFavorites(await getOtherUserFavorites(file.user_id));
    } catch (error) {
      console.log('Error in fetching other user favorites count', error);
    }
  };

  useEffect(() => {
    fetchAvatar();
    fetchProfileOwner();
    fetchUserFiles();
    getOtherUserFavoritesCount();
  }, []);

  const renderItem = ({item, i}) => {
    return (
      <ProfileMediaCard
        item={item}
        style={{marginLeft: i % 2 === 0 ? 0 : 12}}
      />
    );
  };

  // console.log('Profile owner', profileOwner);
  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <View
        style={{
          paddingTop: SIZES.medium,
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <View>
          <Avatar
            rounded
            placeholderStyle={{backgroundColor: COLORS.gray}}
            source={{
              uri: avatar,
            }}
            size={100}
          />
          <View
            style={{
              top: 45,
              left: 45,
              position: 'absolute',
              boarderRadius: SIZES.medium,
            }}
          ></View>
        </View>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <View style={styles.postContainer}>
          <Text style={styles.postTitle}>Total Posts</Text>
          <Text style={styles.postText}>{userFiles.length}</Text>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>Liked Posts</Text>
          <Text>{noOfFavorites}</Text>
        </View>
      </View>
      <View style={styles.usernameContainer}>
        <Text style={styles.usernameText}>
          {profileOwner.full_name || profileOwner.username}
        </Text>
      </View>
      <View style={styles.emailContainer}>
        <Text style={styles.emailText}>{profileOwner.email}</Text>
      </View>
      <Divider />
      <MasonryList
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View />}
        contentContainerStyle={{
          paddingHorizontal: SIZES.large,
          alignSelf: 'stretch',
        }}
        containerStyle={styles.masonryListContainer}
        onEndReached={() => console.log('onEndReached')}
        numColumns={2}
        data={userFiles}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

OtherUserProfile.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

export default OtherUserProfile;
const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  masonryListContainer: {
    marginTop: SIZES.medium,
  },
  emailContainer: {
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
    marginLeft: '10%',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emailText: {
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: SIZES.extraLarge,
  },
  usernameText: {fontWeight: 'bold'},
  usernameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.base,
    marginBottom: SIZES.base,
  },
  postTitle: {fontWeight: 'bold', marginBottom: SIZES.base},
  postText: {fontSize: SIZES.medium},
  postContainer: {alignItems: 'center', justifyContent: 'center'},
});
