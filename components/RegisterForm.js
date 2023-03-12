import {Button, Input} from '@rneui/themed';
import {useForm, Controller} from 'react-hook-form';
import {useUser} from '../hooks';
import {Icon} from '@rneui/themed';
import {
  Text,
  View,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import {Svg, Path} from 'react-native-svg';
import {useContext, useState} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import LottieIcons from '../components/LottieIcons';
import {MainContext} from '../contexts/MainContext';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const RegisterForm = () => {
  const {postUser, checkUsername} = useUser();
  const [userAgreesTCs, checkUserAgreesTCs] = useState(true);
  const navigation = useNavigation();
  const {isNotification, setIsNotification, setNotification} =
    useContext(MainContext);

  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      full_name: '',
    },
    mode: 'onBlur',
  });
  const register = async (registerData) => {
    delete registerData.confirmPassword;
    try {
      const registerResult = await postUser(registerData);
      if (registerResult) {
        setNotification({
          type: 'success',
          title: 'Registered successfully',
          message: 'welcome to the family',
        });
        setIsNotification(!isNotification);
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('register', error);
    }
  };
  const checkUser = async (username) => {
    try {
      const userAvailable = await checkUsername(username);
      return userAvailable || 'Username is already taken';
    } catch (error) {
      console.error('checkUser: ', error.message);
    }
  };
  const createButtonAlert = () => {
    checkUserAgreesTCs(false);
    setNotification({
      type: 'info',
      title: 'Terms and Condition',
      message: 'Do you accept?',
      isOkButton: true,
      isCancelButton: true,
      onOkClick: async function () {
        setIsNotification(false);
        checkUserAgreesTCs(false);
      },
      onCancelClick: async function () {
        setIsNotification(false);
        navigation.navigate('Welcome');
      },
    });
    setIsNotification(!isNotification);
  };

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
        visible={!userAgreesTCs}
      >
        <View>
          <KeyboardAwareScrollView>
            <LottieIcons />
            <Text style={styles.header}>Registration Form</Text>
            <View style={styles.form}>
              <Controller
                control={control}
                rules={{
                  required: {value: true, message: 'Username is required.'},
                  minLength: {
                    value: 3,
                    message: 'Username min length is 3 characters.',
                  },
                  validate: checkUser,
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    placeholder="Username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    leftIcon={
                      <Icon name="person-outline" type="ionicon" size={20} />
                    }
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
                    message: 'Password is required',
                  },
                  pattern: {
                    value: /(?=.*\p{Lu})(?=.*[0-9]).{5,}/u,
                    message:
                      'min 5 characters, needs one number and one uppercase letter',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <View style={{marginTop: -20}}>
                    <Input
                      placeholder="5 characters, 1 number and 1 Uppercase letter."
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={true}
                      leftIcon={
                        <Icon
                          name="lock-closed-outline"
                          type="ionicon"
                          size={20}
                        />
                      }
                      errorMessage={errors.password && errors.password.message}
                    />
                  </View>
                )}
                name="password"
              />
              <Controller
                control={control}
                rules={{
                  validate: (value) => {
                    if (value === getValues('password')) {
                      return true;
                    } else {
                      return 'passwords must match';
                    }
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <View style={{marginTop: -20}}>
                    <Input
                      placeholder="Confirm password"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={true}
                      leftIcon={
                        <Icon
                          name="lock-closed-outline"
                          type="ionicon"
                          size={20}
                        />
                      }
                      errorMessage={
                        errors.confirmPassword && errors.confirmPassword.message
                      }
                    />
                  </View>
                )}
                name="confirmPassword"
              />
              <Controller
                control={control}
                rules={{
                  required: {value: true, message: 'E-mail is required'},
                  pattern: {
                    value: /^[a-z0-9.-]{1,64}@[a-z0-9.-]{3,64}/i,
                    message: 'Must be a valid email',
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <View style={{marginTop: -20}}>
                    <Input
                      placeholder="Email"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      leftIcon={
                        <Icon name="mail-outline" type="ionicon" size={20} />
                      }
                      errorMessage={errors.email && errors.email.message}
                    />
                  </View>
                )}
                name="email"
              />

              <Controller
                control={control}
                rules={{
                  minLength: {value: 3, message: 'must be at least 3 chars'},
                }}
                render={({field: {onChange, onBlur, value}}) => (
                  <View style={{marginTop: -20}}>
                    <Input
                      placeholder="Full name"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      errorMessage={
                        errors.full_name && errors.full_name.message
                      }
                    />
                  </View>
                )}
                name="full_name"
              />
              <Button
                title="Sign up!"
                value={userAgreesTCs}
                onPress={handleSubmit(register)}
                style={{
                  width: Platform.OS === 'ios' ? 150 : -100,
                  marginLeft: Platform.OS === 'ios' ? 100 : 0,
                  marginTop: Platform.OS === 'ios' ? 20 : -10,
                }}
              />
            </View>
          </KeyboardAwareScrollView>
        </View>
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={userAgreesTCs}
          >
            <SafeAreaView>
              <ScrollView
                style={{
                  opacity: 100,
                  backgroundColor: 'white',
                  width: Dimensions.get('screen').width,
                  height: Dimensions.get('screen').height,
                }}
              >
                <Text style={styles.heading}>Terms and Conditions</Text>
                <Text style={styles.paragraph}>1. Introduction </Text>
                <Text style={styles.paragraph}>
                  Welcome to our travel guide mobile application (the "App").
                  These terms and conditions (the "Terms") govern your use of
                  the App. By accessing or using the App, you agree to be bound
                  by these Terms. If you do not agree to these Terms, please do
                  not use the App.
                </Text>
                <Text style={styles.paragraph}>2. License</Text>
                <Text style={styles.paragraph}>
                  Subject to these Terms, we grant you a limited, non-exclusive,
                  non-transferable, revocable license to use the App for your
                  personal, non-commercial use only. You may not reproduce,
                  distribute, display, modify, create derivative works of, sell,
                  or use the App for any commercial purpose without our prior
                  written consent.
                </Text>
                <Text style={styles.paragraph}>3. User Content</Text>
                <Text style={styles.paragraph}>
                  You are solely responsible for any content, including text,
                  images, and videos, that you upload, publish, display, or
                  transmit through the App ("User Content"). You represent and
                  warrant that you have the right to use and publish the User
                  Content and that the User Content does not violate any
                  third-party rights, including intellectual property rights.
                </Text>
                <Text style={styles.paragraph}>4. Prohibited Conduct</Text>
                <Text style={styles.paragraph}>
                  You agree that you will not use the App for any unlawful
                  purpose or in any way that violates these Terms. Specifically,
                  you agree that you will not:{'\n'}
                  {'\u2022'} upload, publish, display, or transmit any User
                  Content that is defamatory, obscene, or offensive;
                  {'\n'}
                  {'\u2022'} use the App to stalk, harass, or harm another
                  person;{'\n'}
                  {'\u2022'} use the App to impersonate any person or entity, or
                  falsely represent your affiliation with any person or entity;
                  {'\n'}
                  {'\u2022'} use the App to distribute viruses, worms, or other
                  harmful software;
                  {'\n'}
                  {'\u2022'} interfere with the operation of the App or disrupt
                  any network or server connected to the App; or{'\n'}
                  {'\u2022'} circumvent any technological measure that we use to
                  protect the App.
                  {'\n'}
                </Text>
                <Text style={styles.paragraph}>
                  5. Intellectual Property Rights
                </Text>
                <Text style={styles.paragraph}>
                  The App and its entire contents, features, and functionality
                  (including but not limited to all information, software, text,
                  displays, images, video, and audio, and the design, selection,
                  and arrangement thereof), are owned by us, our licensors, or
                  other providers of such material and are protected by United
                  States and international copyright, trademark, patent, trade
                  secret, and other intellectual property or proprietary rights
                  laws.
                </Text>
                <Text style={styles.paragraph}>
                  6. Disclaimer of Warranties
                </Text>
                <Text style={styles.paragraph}>
                  THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY
                  REPRESENTATION OR WARRANTY OF ANY KIND, WHETHER EXPRESS,
                  IMPLIED, OR STATUTORY. WE DO NOT WARRANT THAT THE APP WILL BE
                  UNINTERRUPTED, ERROR-FREE, OR FREE FROM VIRUSES OR OTHER
                  HARMFUL COMPONENTS. WE DISCLAIM ALL WARRANTIES, INCLUDING, BUT
                  NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
                  FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                </Text>
                <Text style={styles.paragraph}>7. Limitation of Liability</Text>
                <Text style={styles.paragraph}>
                  IN NO EVENT SHALL WE OR OUR LICENSORS, AFFILIATES, OR SERVICE
                  PROVIDERS BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED
                  TO THE APP OR THESE TERMS, INCLUDING, BUT NOT LIMITED TO, LOSS
                  OF REVENUE, PROFITS, OR BUSINESS, WHETHER BASED ON WARRANTY,
                  CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL
                  THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF
                  SUCH DAMAGES. OUR AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS
                  ARISING OUT OF OR RELATED TO THE APP OR THESE TERMS SHALL NOT
                  EXCEED THE AMOUNT YOU PAID US, IF ANY, TO USE THE APP.
                </Text>
                <Text style={styles.paragraph}>8. Indemnification</Text>
                <Text style={styles.paragraph}>
                  You agree to defend, indemnify, and hold us harmless from and
                  against any claims, liabilities, damages, judgments, awards,
                  losses, costs, expenses, or fees (including reasonable
                  attorneys' fees) arising out of or related to your use of the
                  App
                </Text>
                <Text style={{marginBottom: 100}}></Text>
                <Button
                  title={'I agree to T&Cs'}
                  onPress={() => createButtonAlert()}
                ></Button>
                <Button
                  type="outline"
                  style={{marginTop: 5}}
                  title={'Cancel'}
                  onPress={() => {
                    navigation.navigate('Welcome');
                  }}
                ></Button>
                <Text style={{marginBottom: 100}}></Text>
              </ScrollView>
            </SafeAreaView>
          </Modal>
        </View>
        <Svg style={{bottom: Platform.OS === 'ios' ? 100 : 110, zIndex: -1}}>
          <Path
            fill="#5790DF"
            d="M0,96L30,117.3C60,139,120,181,180,181.3C240,181,300,139,360,144C420,149,480,203,540,192C600,181,660,107,720,80C780,53,840,75,900,112C960,149,1020,203,1080,202.7C1140,203,1200,149,1260,144C1320,139,1380,181,1410,202.7L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
          />
        </Svg>
      </View>
    </>
  );
};
const styles = StyleSheet.create({
  header: {
    marginTop: Platform.OS === 'ios' ? 0 : 0,
    marginLeft: Platform.OS === 'ios' ? 120 : 100,
    marginHorizontal: 70,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'sans-serif',
  },
  form: {
    margin: Platform.OS === 'ios' ? 20 : 10,
    borderColor: 'black',
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Cochin' : 'sans-serif',
    color: 'red',
    marginLeft: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'justify',
    marginLeft: 5,
    marginRight: 5,
  },
});
export default RegisterForm;
