import React, {useState} from 'react';
import PropTypes from 'prop-types';

const MainContext = React.createContext({});

const MainProvider = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [update, setUpdate] = useState(true);
  const [commentUpdate, setCommentUpdate] = useState(false);
  const [postUpdate, setPostUpdate] = useState(0);
  const [likeUpdate, setLikeUpdate] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [isEditPost, setIsEditPost] = useState(false);
  const [isAvatarUpdated, setIsAvatarUpdated] = useState(false);
  const [isUserUpdate, setIsUserUpdate] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [notification, setNotification] = useState({});
  const [isFavouriteUpdated, setIsFavouriteUpdated] = useState(false);

  return (
    <MainContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        update,
        setUpdate,
        commentUpdate,
        setCommentUpdate,
        isEditProfile,
        setIsEditProfile,
        isEditPost,
        setIsEditPost,
        postUpdate,
        setPostUpdate,
        likeUpdate,
        setLikeUpdate,
        isAvatarUpdated,
        setIsAvatarUpdated,
        isUserUpdate,
        setIsUserUpdate,
        isNotification,
        setIsNotification,
        notification,
        setNotification,
        isFavouriteUpdated,
        setIsFavouriteUpdated,
      }}
    >
      {props.children}
    </MainContext.Provider>
  );
};

MainProvider.propTypes = {
  children: PropTypes.node,
};

export {MainContext, MainProvider};
