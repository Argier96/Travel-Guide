import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, SafeAreaView, View} from 'react-native';
import {Button, Card} from '@rneui/themed';
import {Input} from '@rneui/base';
import {Controller, useForm} from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useUser} from '../hooks';
import {MainContext} from '../contexts/MainContext';
import UserAvatar from '../components/UserAvatar';
import {SIZES} from '../theme';

// TODO move styling to style sheet
const ModifyProfile = ({navigation}) => {
  const {checkUsername, updateUser} = useUser();
  const {user, isEditProfile, setIsEditProfile} = React.useContext(MainContext);
  // eslint-disable-next-line camelcase
  const {username, email, full_name} = user;
  const {
    control,
    getValues,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: username || '',
      password: '',
      email: email || '',
      // eslint-disable-next-line camelcase
      full_name: full_name || '',
    },
    mode: 'onBlur',
  });

  const emailRegex = new RegExp(
    /^[A-Za-z0-9_!#$%&'*+/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/,
    'gm'
  );

  const userNameValidation = async (value) => {
    if (value !== user.username) {
      const usernameData = await checkUsername(value).then(
        (usernameData) => usernameData
      );
      return usernameData.available;
    } else {
      return true;
    }
  };

  const comparePassword = (value) => {
    return value === getValues('password') || 'Password not match';
  };

  const onSubmit = async (data) => {
    try {
      await AsyncStorage.getItem('userToken').then(async (userToken) => {
        Object.keys(data).forEach(
          (key) => data[key] === '' && delete data[key]
        );
        if (userToken) {
          await updateUser(data, userToken).then(() => {
            setIsEditProfile(!isEditProfile);
          });
        }
      });
    } catch (error) {
      console.log('Error AsyncStorage userToken');
    }
  };

  return (
    <SafeAreaView>
      <KeyboardAwareScrollView>
        <Card containerStyle={{borderRadius: SIZES.base}}>
          <View
            style={{
              flexDirection: 'row',
              alignContent: 'center',
              justifyContent: 'flex-start',
              marginBottom: SIZES.font,
            }}
          >
            <UserAvatar userId={user.user_id} />
            <Card.Title
              h4
              h4Style={{
                fontWeight: '100',
                textAlign: 'center',
                marginLeft: SIZES.xxl,
              }}
            >
              Edit Profile
            </Card.Title>
          </View>

          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'This field is required',
              },
              minLength: {
                value: 3,
                message: 'Must be at least 3 characters.',
              },
              validate: userNameValidation,
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                value={value}
                onBlur={onBlur}
                placeholder="username"
                onChangeText={onChange}
                autoCapitalize={'none'}
                containerStyle={styles.containerStyle}
                inputStyle={styles.inputFieldInputStyle}
                errorStyle={styles.inputFieldErrorStyle}
                inputContainerStyle={styles.inputContainerStyle}
                errorMessage={errors.username && errors.username.message}
              />
            )}
            name="username"
          />

          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'This field is required',
              },
              minLength: {
                value: 5,
                message: 'Must be at least 5 characters.',
              },
              pattern: {
                value: /(?=.*\p{Lu})(?=.*[0-9]).{5,}/u,
                message: 'Min 3 Characters, 1 number and 1 uppercase letter',
              },
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                value={value}
                onBlur={onBlur}
                placeholder="3 characters, 1 number and 1 Uppercase letter."
                secureTextEntry={true}
                onChangeText={onChange}
                autoCapitalize={'none'}
                autoComplete={'password'}
                containerStyle={styles.containerStyle}
                inputStyle={styles.inputFieldInputStyle}
                errorStyle={styles.inputFieldErrorStyle}
                inputContainerStyle={styles.inputContainerStyle}
                errorMessage={errors.password && errors.password.message}
              />
            )}
            name="password"
          />

          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'This field is required',
              },
              validate: comparePassword,
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                value={value}
                onBlur={onBlur}
                secureTextEntry={true}
                onChangeText={onChange}
                autoCapitalize={'none'}
                autoComplete={'password'}
                placeholder="Confirm password"
                containerStyle={styles.containerStyle}
                inputStyle={styles.inputFieldInputStyle}
                errorStyle={styles.inputFieldErrorStyle}
                inputContainerStyle={styles.inputContainerStyle}
                errorMessage={
                  errors.confirm_password && errors.confirm_password.message
                }
              />
            )}
            name="confirm_password"
          />

          <Controller
            control={control}
            rules={{
              required: {
                value: true,
                message: 'This field is required',
              },
              pattern: {
                value: emailRegex,
                message: 'Must be a valid email',
              },
            }}
            render={({field: {onChange, onBlur, value}}) => (
              <Input
                value={value}
                onBlur={onBlur}
                placeholder="email"
                onChangeText={onChange}
                autoCapitalize={'none'}
                containerStyle={styles.containerStyle}
                inputStyle={styles.inputFieldInputStyle}
                errorStyle={styles.inputFieldErrorStyle}
                inputContainerStyle={styles.inputContainerStyle}
                errorMessage={errors.email && errors.email.message}
              />
            )}
            name="email"
          />

          <Button
            title="Save Changes"
            buttonStyle={{
              ...styles.buttonStyle,
              backgroundColor: 'rgba(78, 116, 289, 1)',
            }}
            containerStyle={styles.btnContainer}
            titleStyle={styles.buttonTitleStyle}
            onPress={handleSubmit(onSubmit)}
          />
          <Button
            title="Cancel"
            buttonStyle={{
              ...styles.buttonStyle,
              backgroundColor: 'white',
            }}
            containerStyle={styles.btnContainer}
            titleStyle={{
              ...styles.buttonTitleStyle,
              color: 'black',
            }}
            onPress={() => {
              setIsEditProfile(!isEditProfile);
            }}
          />
        </Card>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginBottom: SIZES.medium,
    borderRadius: SIZES.xxl,
    borderColor: 'gray',
    borderWidth: 1,
    paddingRight: SIZES.medium,
    paddingLeft: SIZES.medium,
    height: 48,
  },
  inputFieldErrorStyle: {
    color: 'red',
    textAlign: 'center',
  },
  inputFieldInputStyle: {
    fontSize: SIZES.medium,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  buttonStyle: {
    height: 48,
    borderRadius: SIZES.xxl,
  },
  buttonTitleStyle: {
    fontSize: SIZES.small,
  },
  btnContainer: {
    elevation: SIZES.large,
    marginBottom: SIZES.medium,
  },
});

ModifyProfile.propTypes = {
  navigation: PropTypes.object,
};

export default ModifyProfile;
