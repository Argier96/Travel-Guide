import {FlatList, Text, View} from 'react-native';
import {useContext, useEffect, useState} from 'react';
import {useComment} from '../hooks';

import {MainContext} from '../contexts/MainContext';
import CommentItem from './CommentItem';
import {SIZES} from '../theme';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';

const ListComment = ({navigation, fileId}) => {
  const {getCommentById} = useComment();
  const [comments, setComments] = useState([]);
  const {commentUpdate} = useContext(MainContext);
  const [error, setError] = useState(false);

  const fetchComments = async () => {
    try {
      const commentsData = await getCommentById(fileId);
      setComments(commentsData);
    } catch (e) {
      console.error('Error in fetching comments', e);
      setError(true);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [commentUpdate]);

  const ListEmptyComponent = () => (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
      }}
    >
      <LottieView
        style={{width: 150, height: 130}}
        source={require('../assets/lottie/send-comment.json')}
        autoPlay
        loop
      />
      <Text style={{fontSize: 18}}>No Comments on this post</Text>
    </View>
  );
  return (
    <View
      style={{
        height: 220,
        backgroundColor: '#E6EEFA',
        marginBottom: SIZES.base,
      }}
    >
      <Text
        style={{
          textAlign: 'left',
          marginTop: -5,
          padding: 5,
          fontSize: 15,
        }}
      >
        Comments
      </Text>
      {error ? (
        <Text>Error loading comments</Text>
      ) : (
        <View
          style={{
            height: 200,
            width: '100%',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 8,
            paddingRight: 8,

            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.comment_id}
            renderItem={({item}) => (
              <CommentItem navigation={navigation} singleComment={item} />
            )}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
          />
        </View>
      )}
    </View>
  );
};
ListComment.propTypes = {
  fileId: PropTypes.number.isRequired,
  navigation: PropTypes.object,
};

export default ListComment;
