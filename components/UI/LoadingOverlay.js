import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

//Used in most sheets to show a spinner if the data is loading
function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={GlobalStyles.colors.primary50} />
    </View>
  );
}

export default LoadingOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary700,
  },
});
