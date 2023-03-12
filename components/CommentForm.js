import {View, Alert, Text, StyleSheet} from 'react-native';
import {TextInput} from 'react-native';
import {Button} from '@rneui/themed';
import {Controller, useForm} from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useComment} from '../hooks';
import {useContext, useCallback} from 'react';
import {MainContext} from '../contexts/MainContext';
import {useFocusEffect} from '@react-navigation/native';
import PropTypes from 'prop-types';

const CommentForm = ({fileId}) => {
  const {postComment} = useComment(fileId);
  const {
    commentUpdate,
    setCommentUpdate,
    isNotification,
    setIsNotification,
    setNotification,
  } = useContext(MainContext);
  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      comment: '',
    },
  });
  const reset = () => {
    setValue('comment', '');
  };
  useFocusEffect(
    useCallback(() => {
      return () => reset();
    }, [])
  );
  const postUserComment = async (comment) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!comment.comment.trim()) {
        return;
      }
      const response = await postComment(token, {
        file_id: fileId,
        comment: comment.comment,
      });
      if (response) {
        setNotification({
          type: 'success',
          title: 'Success',
          message: 'Comment uploaded',
        });
        setIsNotification(!isNotification);
        reset();
        setCommentUpdate(!commentUpdate);
      }
    } catch (e) {
      console.error('Error on uploading comment');
    }
  };

  return (
    <View style={styles.commentFormContainer}>
      <Controller
        control={control}
        rules={{
          required: {value: true, message: 'This is required'},
          minLength: {
            value: 3,
            message: 'Comment must be at least 3 characters',
          },
        }}
        render={({field: {onChange, onBlur, value}}) => (
          <View style={styles.commentBox}>
            <TextInput
              inputContainerStyle={styles.commentInputContainer}
              multiline
              numberOfLines={3}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              placeholder="Leave a comment"
            />
          </View>
        )}
        name="comment"
      />

      {errors.comment && <Text>Please enter valid comment.</Text>}
      <Button
        buttonStyle={styles.buttonContainer}
        title={'send'}
        onPress={handleSubmit(postUserComment)}
      />
    </View>
  );
};

CommentForm.propTypes = {
  fileId: PropTypes.number.isRequired,
};
export default CommentForm;
const styles = StyleSheet.create({
  commentFormContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyItems: 'center',
    alignItems: 'center',
    width: 300,
    marginTop: 3,
    marginLeft: 6,
    marginBottom: 15,
  },
  commentInputContainer: {
    padding: 8,
    margin: 10,
    height: 18,
    width: 250,
  },
  commentBox: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#999',
    paddingHorizontal: 10,
    paddingVertical: 8,
    margin: 10,
    width: 250,
    height: 40,
  },
  buttonContainer: {
    borderRadius: 10,
  },
});
