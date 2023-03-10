import React, {useContext} from 'react';
import ModifyProfile from './ModifyProfile';
import {MainContext} from '../contexts/MainContext';
import ViewProfile from './ViewProfile';

const UserProfile = () => {
  const {isEditProfile} = useContext(MainContext);
  return isEditProfile ? <ModifyProfile /> : <ViewProfile />;
};
export default UserProfile;
