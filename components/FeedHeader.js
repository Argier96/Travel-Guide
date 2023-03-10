import {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SIZES, FONTS} from '../theme';
import {MainContext} from '../contexts/MainContext';
import TopPost from './TopPost';
import UserAvatar from './UserAvatar';

const FeedHeader = () => {
  const {user} = useContext(MainContext);

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 0 && hour < 5) {
      greeting = 'Good night';
    } else if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else if (hour >= 18 && hour < 22) {
      greeting = 'Good evening';
    } else {
      greeting = 'Good night';
    }

    return greeting;
  };
  return (
    <View style={styles.headerContainer}>
      <View style={styles.logoContainer}>
        <Text style={{fontSize: 18, fontWeight: 'bold', color: 'black'}}>
          Travel Guide
        </Text>

        <View style={styles.userAvatarContainer}>
          <UserAvatar userId={user.user_id} />
        </View>
      </View>
      <View>
        <View style={styles.greetContainer}>
          <Text style={styles.greetUsername}>Hello {user.username} 👋</Text>

          <Text style={styles.greet}>{getGreeting()} 😃</Text>
        </View>
      </View>
      <TopPost />
    </View>
  );
};

export default FeedHeader;

const styles = StyleSheet.create({
  feedOption: {
    fontSize: 20,
  },
  RecOption: {
    fontSize: 20,
    marginLeft: 20,
  },
  leftMargin: {marginLeft: 20},

  headerContainer: {
    backgroundColor: '#a9d1f3',
    padding: SIZES.font,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    width: 170,
    height: 60,
  },
  userAvatarContainer: {width: 45, height: 45, marginRight: 20},
  userAvatar: {width: '100%', height: '100%', borderRadius: 25},
  avatarBadge: {
    position: 'absolute',
    width: SIZES.font,
    height: SIZES.font,
    bottom: 0,
    right: 0,
  },
  greetContainer: {
    marginVertical: SIZES.font,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetUsername: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.large,
    color: 'black',
    marginRight: SIZES.medium,
  },
  greet: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.large,
    color: 'black',
  },
  userChoice: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: SIZES.base,
  },
});
