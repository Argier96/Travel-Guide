import PropTypes from 'prop-types';
import React, {useContext, useEffect, useState} from 'react';
import {Avatar, Button, Icon} from '@rneui/themed';
import MasonryList from '@react-native-seoul/masonry-list';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {MainContext} from '../contexts/MainContext';
import {useFavourite, useMedia, useTag} from '../hooks';
import {ProfileMediaCard} from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {uploadsUrl} from '../utils';
import EmptyListAnimation from '../components/ListEmptyAnimation';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../components/UserAvatar';

const ViewProfile = ({myFilesOnly = true}) => {
  const {mediaArray} = useMedia(myFilesOnly);
  const {getFilesByTag} = useTag();
  const {postUpdate, setPostUpdate} = useContext(MainContext);
  const [index, setIndex] = useState('none');
  const [eventName, setEventName] = useState('none');
  const [selectedOption, setSelectedOption] = useState('none');
  const {update} = useContext(MainContext);
  const [avatar, setAvatar] = useState('http://placekitten.com/640');
  const [noOfFavorites, setNoOfFavorites] = useState(0);
  const {getUserFavorites} = useFavourite();
  const navigation = useNavigation();
  const {user, setIsLoggedIn, isEditProfile, setIsEditProfile} =
    React.useContext(MainContext);

  const loadAvatar = async () => {
    try {
      const avatarArray = await getFilesByTag('avatar_' + user.user_id);
      // console.log(avatarArray);
      const avatar = avatarArray.pop().filename;
      setAvatar(uploadsUrl + avatar);
    } catch (error) {
      console.error('user avatar fetch failed', error.message);
    }
  };
  const renderItem = ({item, i}) => {
    return (
      <ProfileMediaCard
        item={item}
        style={{marginLeft: i % 2 === 0 ? 0 : 12}}
        myFilesOnly={myFilesOnly}
      />
    );
  };

  const logout = async () => {
    Alert.alert('Are you sure of ', 'logging out?', [
      {text: 'Cancel'},
      {
        text: 'OK',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            setIsLoggedIn(false);
          } catch (error) {
            console.log('Error while logging out: ' + error);
          }
        },
      },
    ]);
  };
  useEffect(() => {
    loadAvatar();
  }, [update]);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <View style={{flexDirection: 'column', marginTop: 20}}>
        <View style={{alignSelf: 'center'}}>
          <Avatar
            rounded
            source={{
              uri: avatar,
            }}
            size="large"
          />
          <View
            style={{
              top: 45,
              left: 45,
              position: 'absolute',
              boarderRadius: 16,
            }}
          >
            <Icon
              size={16}
              raised
              reverse
              name="camera"
              type="ionicon"
              color={'rgba(78, 116, 289, 1)'}
              onPress={() => {
                navigation.navigate('ModifyAvatar');
              }}
              containerStyle={{padding: 0, margin: 0}}
            />
          </View>
        </View>
      </View>

      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>Total Posts</Text>
          <Text>{mediaArray.length}</Text>
        </View>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontWeight: 'bold', marginBottom: 8}}>Liked Posts</Text>
          <Text>{noOfFavorites}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <Text style={{fontWeight: 'bold'}}>{user.full_name}</Text>
      </View>
      <View
        style={{
          marginTop: 8,
          marginBottom: 8,
          marginLeft: '10%',
          width: '80%',
          flexDirection: 'row',
          justifyContent: 'space-around',
          // /!* backgroundColor: 'rgba(78, 116, 289, 1)',*!/
        }}
      >
        <Text
          style={{
            textAlignVertical: 'center',
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          {user.email}
        </Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <Button
          title="Edit Profile"
          buttonStyle={{
            height: 48,
            width: 120,
            backgroundColor: 'rgba(78, 116, 289, 1)',
            borderRadius: 36,
          }}
          titleStyle={{
            fontSize: 13,
            color: 'white',
          }}
          containerStyle={{elevation: 20}}
          onPress={() => {
            // navigation.navigate('ModifyProfile');
            setIsEditProfile(!isEditProfile);
          }}
        />
        <Button
          title="Log out"
          size={'lg'}
          buttonStyle={{
            height: 48,
            width: 120,
            backgroundColor: 'white',
            borderRadius: 36,
            paddingVertical: 5,
          }}
          titleStyle={{
            fontSize: 13,
            color: 'black',
          }}
          containerStyle={{elevation: 20}}
          onPress={logout}
        />
      </View>
      <MasonryList
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View />}
        contentContainerStyle={{
          paddingHorizontal: 18,
          alignSelf: 'stretch',
        }}
        containerStyle={{
          marginTop: 16,
        }}
        onEndReached={() => console.log('onEndReached')}
        numColumns={2}
        data={mediaArray}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyListAnimation title={'No Posts Yet'} />}
      />
    </SafeAreaView>
  );
};

ViewProfile.propTypes = {
  navigation: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};

export default ViewProfile;
