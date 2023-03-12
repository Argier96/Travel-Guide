import React, {useContext} from 'react';
import {MainContext} from '../contexts/MainContext';
import {Overlay} from 'react-native-elements';
import {NotificationWrapper} from './Notification/NotificationWrapper';

const Notification = () => {
  const {isNotification, setIsNotification, notification} =
    useContext(MainContext);
  return (
    <Overlay
      isVisible={isNotification}
      onBackdropPress={() => setIsNotification(!isNotification)}
      overlayStyle={{
        padding: 0,
        borderRadius: 8,
        zIndex: 5,
      }}
    >
      <NotificationWrapper
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isOkButton={notification.isOkButton}
        isCancelButton={notification.isCancelButton}
        onClosePress={() => {
          setIsNotification(!isNotification);
        }}
        onOkClick={notification.onOkClick}
        onCancelClick={notification.onCancelClick}
      />
    </Overlay>
  );
};

export default Notification;
