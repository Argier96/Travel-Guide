import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {useMedia} from '../hooks';
import {COLORS, SHADOWS} from '../theme';
import {uploadsUrl} from '../utils';
import {Avatar} from '@rneui/themed';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';

const TopPost = ({myFilesOnly = false}) => {
  const navigation = useNavigation();
  const {mediaArray} = useMedia(myFilesOnly);

  const PostItem = ({singleItem}) => {
    return (
      <TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Avatar
            rounded
            size={'large'}
            source={{uri: uploadsUrl + singleItem?.thumbnails.w160}}
            onPress={() => {
              navigation.navigate('SinglePost', singleItem);
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const renderUsersItem = ({item}) => <PostItem singleItem={item} />;
  return (
    <View style={styles.postItemContainer}>
      <Text style={styles.postText}>Top Posts</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={mediaArray}
        renderItem={renderUsersItem}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.feedView}>
        <Text style={styles.feedText}>Feed</Text>
      </View>
    </View>
  );
};
TopPost.propTypes = {
  singleItem: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};
export default TopPost;

const styles = StyleSheet.create({
  postItemContainer: {
    flex: 1,
    backgroundColor: '#91bdfa',
    paddingVertical: 10,
    marginTop: 10,
    margin: -10,
    borderRadius: 10,
    ...SHADOWS.dark,
  },
  postText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: -8,
  },
  feedView: {
    backgroundColor: COLORS.primary,
    padding: 5,
    marginTop: 5,
    marginBottom: -15,
  },
  feedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    margin: 5,
    borderRadius: 40,
  },
});
