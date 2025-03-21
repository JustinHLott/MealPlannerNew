import { View, Text, TextInput, StyleSheet } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

//This goes in the AuthForm as a template for all the input boxes
function InputSettings({
  keyboardType,
  onUpdateValue,
  value,
  placeholder,
  onFocus
}) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input]}
        autoCapitalize={false}
        keyboardType={keyboardType}
        onChangeText={onUpdateValue}
        value={value}
        placeholder={placeholder}
        onFocus={onFocus}
      />
    </View>
  );
}

export default InputSettings;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 0,
    marginHorizontal: 4,
  },
  input: {
    height: 38,
    width: 200,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'blue',
    //justifyContent: 'left',
    //alignItems: 'left',
    placeholderTextColor: GlobalStyles.colors.primary800,
    color: GlobalStyles.colors.primary800,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 0,
    marginTop: 2,
    fontSize: 13,
    // justifyContent: 'center',
    // alignItems: 'center',
    // textAlign:'left',
    // textAlignVertical: "bottom", // Moves text to the bottom
    // paddingVertical: 3,
  },
});
