import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useState, useContext, useEffect} from 'react';
import {useComment} from '../hooks';

import {MainContext} from '../contexts/MainContext';
import {Card} from '@rneui/themed';
import CommentItem from './CommentItem';
import {COLORS, SIZES, FONTS, SHADOWS} from '../theme';
import PropTypes from 'prop-types';

const ListComment = ({navigation, fileId}) => {
  const {getCommentById} = useComment();
  const [comments, setComments] = useState([]);
  const {commentUpdate} = useContext(MainContext);
  const [error, setError] = useState(false);

  const fetchComments = async () => {
    try {
      const commentsData = await getCommentById(fileId);
      console.log('Data from comment', commentsData);
      setComments(commentsData);
    } catch (e) {
      console.log('Error in fetching comments', e);
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
        height: 50,
      }}
    >
      <Text style={{fontSize: 18}}>No Comments on this post</Text>
    </View>
  );
  return (
    <View
      style={{
        height: 245,
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
        <View style={{marginBottom: 25}}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.comment_id.toString()}
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
