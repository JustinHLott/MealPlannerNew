import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { GlobalStyles } from '../../constants/styles';

function IconButton({ icon, size, color, onPress, forLongPress, iconText, awesome }) {
  let iconType;
  if(awesome){
    iconType = <FontAwesome name={awesome} size={size} color={color} />
  }else{
    iconType = <Ionicons name={icon} size={size} color={color} />
  }
  return (
    <Pressable
      onPress={onPress}
      onLongPress={forLongPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={styles.buttonContainer}>
        {iconType}
        <Text style={styles.text}>{iconText}</Text>
      </View>
    </Pressable>
  );
}

export default IconButton;

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 24,
    padding: 6,
    marginHorizontal: 2,
    marginVertical: 2,
    alignItems: "center"
  },
  pressed: {
    opacity: 0.75,
  },
  text:{
    color: GlobalStyles.colors.primary50
  }
});
