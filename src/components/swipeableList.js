import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SwipeableRightActions = ({ data, handleDelete, handleEdit }) => {
  return (
    <View style={styles.containerSwipeable}>
      <RectButton
        style={styles.containerItemSwipeable}
        onPress={() => handleEdit(data)}>
        <MaterialCommunityIcons
          name="file-document-edit-outline"
          size={30}
          color="#0055AA"
        />
        <Text>Editar</Text>
      </RectButton>

      <RectButton
        style={styles.containerItemSwipeable}
        onPress={() => handleDelete(data)}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={30}
          color="#0055AA"
        />
        <Text>Deletar</Text>
      </RectButton>
    </View>
  );
};

function SwipeableList({
  data,
  handleShow,
  handleDelete,
  handleEdit,
  onOpen,
  onClose,
  icon,
  children,
}) {
  const rowRef = useRef();
  let isOpened;

  const onSwipeOpen = () => {
    if (!isOpened) {
      isOpened = true;
      onOpen(rowRef);
    }
  };
  const onSwipeClose = () => {
    if (isOpened) {
      isOpened = false;
      onClose(rowRef);
    }
  };
  return (
    <View style={styles.containerCardRemember}>
      <Swipeable
        ref={rowRef}
        onSwipeableOpen={onSwipeOpen}
        onSwipeableClose={onSwipeClose}
        renderRightActions={id => (
          <SwipeableRightActions
            data={data}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        )}>
        <RectButton
          style={styles.cardRemember}
          onPress={() => handleShow && handleShow(data.id)}>
          <View style={styles.iconCard}>
            <MaterialCommunityIcons name={icon} color="#0055AA" size={50} />
          </View>
          {children}
        </RectButton>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  containerCardRemember: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardRemember: {
    borderRadius: 20,

    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 20,
  },

  iconCard: {
    paddingLeft: 10,
    paddingRight: 30,
    alignSelf: 'center',
  },

  detailsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  containerSwipeable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  containerItemSwipeable: {
    marginLeft: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    alignContent: 'center',
  },
});
export default SwipeableList;
