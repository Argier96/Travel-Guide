import {Button, Text, Input} from '@rneui/themed';
import {useForm, Controller} from 'react-hook-form';
import {MainContext} from '../contexts/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useContext, useState} from 'react';
import {Icon} from '@rneui/themed';
import {Svg, Path} from 'react-native-svg';
import LottieIcons from '../components/LottieIcons';

import PropTypes from 'prop-types';
import {useAuthentication} from '../utils';
import {View, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const LoginForm = ({navigation}) => {
  const {setIsLoggedIn, setUser} = useContext(MainContext);
  const {postLogin} = useAuthentication();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const onSubmit = async (data) => {
    try {
      const userData = await postLogin(data);
      await AsyncStorage.setItem('userToken', userData.token);
      setUser(userData.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error on onSubmit:', error);
    }
  };

  return (
    <View>
      <LottieIcons />
      <Text style={styles.header}>TRAVEL GUIDE</Text>

      <View style={styles.form}>
        <Controller
          control={control}
          rules={{
            required: true,
            minLength: 3,
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <Input
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              placeholder="Username"
              style={{margin: 5}}
              leftIcon={<Icon name="person-outline" type="ionicon" size={22} />}
            />
          )}
          name="username"
        />
        {errors.username?.type === 'required' && (
          <Text style={styles.text}>is required</Text>
        )}
        {errors.username?.type === 'minLength' && (
          <Text style={styles.text}>min length is 3 characters</Text>
        )}

        <Controller
          control={control}
          rules={{
            required: true,
            minLength: 5,
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <View style={{marginTop: -20}}>
              <Input
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
                leftIcon={
                  <Icon
                    name="lock-closed-outline"
                    type="ionicon"
                    size={22}
                    style={{marginRight: 10}}
                  />
                }
                rightIcon={
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Icon
                      type="ionicon"
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={25}
                    />
                  </TouchableOpacity>
                }
                placeholder="Password"
              />
            </View>
          )}
          name="password"
        />
        {errors.password && (
          <Text style={styles.text}>Password (min. 5 chars) is required .</Text>
        )}
        <Button
          title="Sign in"
          onPress={handleSubmit(onSubmit)}
          buttonStyle={{
            width: 200,
            borderRadius: 36,
            marginTop: 0,
            marginLeft: Platform.OS === 'ios' ? 51 : 65,
            elevation: 5,
          }}
        />
      </View>

      <Svg style={{bottom: Platform.OS === 'ios' ? 0 : 20}}>
        <Path
          fill="#5790DF"
          d="M0,96L30,117.3C60,139,120,181,180,181.3C240,181,300,139,360,144C420,149,480,203,540,192C600,181,660,107,720,80C780,53,840,75,900,112C960,149,1020,203,1080,202.7C1140,203,1200,149,1260,144C1320,139,1380,181,1410,202.7L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
        />
      </Svg>
    </View>
  );
};
const styles = StyleSheet.create({
  header: {
    marginTop: Platform.OS === 'ios' ? 10 : 10,
    marginLeft: Platform.OS === 'ios' ? 105 : 105,
    fontSize: 25,
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'sans-serif',
  },
  form: {
    margin: Platform.OS === 'ios' ? 50 : 20,
    borderColor: 'black',
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'sans-serif',
    color: 'red',
    marginLeft: 20,
  },
});
LoginForm.propTypes = {
  navigation: PropTypes.object,
};
export default LoginForm;
