import {View} from 'react-native';
import React from 'react';
import ListCommenter from '../components/ListCommenter';
import PropTypes from 'prop-types';

const CommentedBy = ({route, navigation}) => {
  const {file} = route.params;
  return (
    <View>
      <ListCommenter navigation={navigation} fileId={file.file_id} />
    </View>
  );
};

export default CommentedBy;
CommentedBy.propTypes = {
  route: PropTypes.object.isRequired,
  navigation: PropTypes.object,
};
