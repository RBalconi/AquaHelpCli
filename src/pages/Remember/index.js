import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ToastAndroid,
  FlatList,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';

import getRealm from '../../services/realm';
import { NotificationConfigure } from '../../services/notification';

import SwipeableList from '../../components/swipeableList';
import Loading from '../../components/loading';

const RememberIndex = () => {
  PushNotification.configure = NotificationConfigure;
  const navigation = useNavigation();

  const [remember, setRemember] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const listWeekDay = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  let swipedCardRef = null;

  const onOpen = ref => {
    if (swipedCardRef) {
      swipedCardRef.current.close();
    }
    swipedCardRef = ref;
  };
  const onClose = ref => {
    if (ref === swipedCardRef) {
      swipedCardRef = null;
    }
  };

  function chooseIcon(category) {
    switch (category) {
      case 'fertilizer':
        return 'leaf';
      case 'medication':
        return 'flask-empty-plus';
      case 'supplementation':
        return 'food-variant';
      case 'tpa':
        return 'water';
    }
  }

  function cancelNotification(id) {
    PushNotification.cancelLocalNotifications({ id: id.toString() });
    PushNotification.getScheduledLocalNotifications(res => {
      console.log(res);
    });
    // PushNotification.cancelLocalNotifications(2);
  }

  async function deleteRemember(rememberData) {
    setIsLoading(true);
    const realm = await getRealm();
    try {
      const deletingRemember = realm
        .objects('Remember')
        .filtered(`id = '${rememberData.id}'`);

      console.log(JSON.stringify(rememberData, null, 2));
      cancelNotification(rememberData.id);
      realm.write(() => {
        realm.delete(deletingRemember);
      });
    } catch (error) {
      ToastAndroid.showWithGravityAndOffset(
        'Ocorreu um erro ao excluir!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }
    setIsLoading(false);
  }
  function handleDeleteRemember(rememberData) {
    Alert.alert(
      'Excluir',
      `Tem certeza que deseja excluir "${rememberData.name}"?`,
      [
        {
          text: 'Sim',
          onPress: () => {
            deleteRemember(rememberData);
          },
        },
        {
          text: 'Talvez depois',
          onPress: () => {},
        },
      ],
    );
  }

  async function setRememberRealm() {
    setIsLoading(true);
    const realm = await getRealm();
    const data = realm.objects('Remember').sorted('name', false);
    setRemember(data);
    setIsLoading(false);
  }

  async function removeListernerRefreshRemember() {
    const realm = await getRealm();
    realm.removeListener('change', () => {});
  }

  const startListenerRefreshRemember = useCallback(async () => {
    const realm = await getRealm();
    realm.addListener('change', () => setRememberRealm());
  }, []);

  useEffect(() => {
    startListenerRefreshRemember();
    return () => {
      removeListernerRefreshRemember();
    };
  }, [startListenerRefreshRemember]);

  useEffect(() => {
    setRememberRealm();
  }, []);

  function handleNavigateToCreate() {
    navigation.navigate('RememberCreate', { rememberId: 0 });
  }

  function repeatDays(item) {
    if (item.repeat === 'notRepeat') {
      return 'Não repetir';
    } else if (item.repeat === 'everyDay') {
      return `Todo dia - ${moment(item.time).format('HH:mm')}`;
    } else if (listWeekDay.some(day => item.repeat.includes(day))) {
      return `Dias específicos - ${moment(item.time).format('HH:mm')}`;
    } else {
      return `Intervalo de dias - ${moment(item.time).format('HH:mm')}`;
    }
  }

  return (
    <>
      <View style={styles.containerContent}>
        <Loading show={isLoading} color={'#0055AA'} size={'large'} />
        <View>
          {remember.length <= 0 && isLoading !== true ? (
            <Text style={{ color: '#000', alignSelf: 'center' }}>
              Nenhum lembrete cadastrado.
            </Text>
          ) : (
            <FlatList
              data={remember}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <SwipeableList
                  data={item}
                  icon={chooseIcon(item.category)}
                  handleDelete={handleDeleteRemember}
                  // handleEdit={handleEditAquarium}
                  onOpen={onOpen}
                  onClose={onClose}>
                  <View style={styles.textsCard}>
                    <Text style={styles.titleCard}>{item.name}</Text>
                    <Text style={styles.dataCard}>
                      Aquario XXXXXXXXX{item.aquarium}
                    </Text>
                    <View style={styles.measures}>
                      <Text style={styles.info}>
                        {item.quantity + ' ' + item.unity}.
                      </Text>
                      <Text style={styles.info}>
                        {repeatDays(item)}
                        {/* {moment(item.time).format('HH:mm') +
                          ' - ' +
                          moment(item.date).format('DD [de] MMMM')} */}
                      </Text>
                    </View>
                  </View>
                </SwipeableList>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.floattingButton}
        onPress={handleNavigateToCreate}
        activeOpacity={0.6}>
        <MaterialCommunityIcons name="plus" size={44} color="#FFF" />
      </TouchableOpacity>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingTop: 20 + StatusBar.currentHeight,
  },

  containerContent: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    borderTopStartRadius: 40,
    paddingBottom: 0,
  },
  textsCard: {
    flex: 1,
    alignContent: 'space-between',
  },
  titleCard: {
    color: '#334455',
    fontFamily: 'Roboto-Bold',
    fontSize: 20,
    paddingBottom: 4,
  },
  dataCard: {
    color: '#334455',
    fontFamily: 'Roboto-Light',
    fontSize: 16,
  },
  measures: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    color: '#3A4E5F',
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },

  floattingButton: {
    position: 'absolute',
    width: 57,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    bottom: 20,
    backgroundColor: '#0055AA',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
});

export default RememberIndex;
