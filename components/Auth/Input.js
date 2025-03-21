import { View, Text, TextInput, StyleSheet } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

//This goes in the AuthForm as a template for all the input boxes
function Input({
  label,
  keyboardType,
  secure,
  onUpdateValue,
  value,
  isInvalid,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, isInvalid && styles.labelInvalid]}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, isInvalid && styles.inputInvalid]}
        autoCapitalize={false}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        onChangeText={onUpdateValue}
        value={value}
      />
    </View>
  );
}

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  label: {
    color: GlobalStyles.colors.primary50,
    marginBottom: 4,
  },
  labelInvalid: {
    color: GlobalStyles.colors.error500,
  },
  input: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: GlobalStyles.colors.primary50,
    borderRadius: 4,
    fontSize: 16,
  },
  inputInvalid: {
    backgroundColor: GlobalStyles.colors.primary50,
  },
});
