import {FlatList, SafeAreaView, StyleSheet} from 'react-native';
import ListItem from './ListItem';
import {useMedia} from '../hooks';
import {View} from 'react-native';
import FeedHeader from './FeedHeader';
import {COLORS} from '../theme';
import PropTypes from 'prop-types';

const List = ({navigation, myFilesOnly = false}) => {
  const {mediaArray} = useMedia(myFilesOnly);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.flatListContainer}>
          <FlatList
            data={mediaArray}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <ListItem
                navigation={navigation}
                singleMedia={item}
                myFilesOnly={myFilesOnly}
              />
            )}
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<FeedHeader />}
          />
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.upperCard} />
          <View style={styles.lowerCard} />
        </View>
      </View>
    </SafeAreaView>
  );
};
List.propTypes = {
  navigation: PropTypes.object,
  myFilesOnly: PropTypes.bool,
};

export default List;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    zIndex: 0,
  },

  //  whole card container
  cardContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: -1,
  },
  // lowercard background
  lowerCard: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // uppercard for background
  upperCard: {
    height: 300,
    backgroundColor: COLORS.primary,
  },
});
