import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

function Input({ label, invalid, style, textInputConfig }) {




  return (
    <View style={[styles.inputContainer, style]}>
      <TextInput style={styles.inputAll} />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8
  },
  inputAll: {
    backgroundColor: GlobalStyles.colors.primary100,
    color: GlobalStyles.colors.primary700,
    padding: 6,
    borderRadius: 6,
    fontSize: 18,
  },

});
