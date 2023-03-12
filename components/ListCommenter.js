import {SafeAreaView, StyleSheet, Text, View, FlatList} from 'react-native';
import React from 'react';
import {useState, useContext, useEffect} from 'react';
import {SIZES, COLORS} from '../theme';
import {useComment} from '../hooks';
import {MainContext} from '../contexts/MainContext';
import LikeItem from './LikeItem';
import PropTypes from 'prop-types';
import AnimatedLottieView from 'lottie-react-native';

const ListCommenter = ({navigation, fileId}) => {
  const [comments, setComments] = useState([]);
  const {getCommentById} = useComment();
  const {commentUpdate} = useContext(MainContext);

  const fetchComments = async () => {
    try {
      const commentData = await getCommentById(fileId);
      setComments(commentData);
    } catch (error) {
      console.error('fetchComment() error', error);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [commentUpdate]);

  const CommentListHeader = () => (
    <View>
      <AnimatedLottieView
        style={styles.animation}
        source={require('../assets/lottie/like.json')}
        autoPlay
        loop
      />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          marginBottom: 20,
        }}
      >
        <Text style={{fontSize: SIZES.extraLarge}}>Commentators</Text>
      </View>
    </View>
  );
  const CommentListEmptyComponent = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
      }}
    >
      <Text style={{fontSize: 18}}>No comments on this post</Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.flatListContainer}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.comment_id}
            renderItem={({item}) => (
              // Re-using component
              <LikeItem navigation={navigation} singleLike={item} />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={CommentListEmptyComponent}
            ListHeaderComponent={CommentListHeader}
          />
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.lowerCard} />
          <View style={styles.upperCard} />
        </View>
      </View>
    </SafeAreaView>
  );
};

ListCommenter.propTypes = {
  fileId: PropTypes.number.isRequired,
  navigation: PropTypes.object,
};
export default ListCommenter;

const styles = StyleSheet.create({
  container: {
    //flex: 1,
  },
  flatListContainer: {
    zIndex: 0,
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: -1,
  },
  lowerCard: {
    height: 700,
    backgroundColor: COLORS.white,
  },
  upperCard: {
    height: 300,
    backgroundColor: COLORS.primary,
  },
  headerContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
