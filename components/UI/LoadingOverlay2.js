import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';

import { GlobalStyles } from '../../constants/styles';

function LoadingOverlay() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={GlobalStyles.colors.primary50} />
      <Image source={require('../../assets/icon.png')} style={styles.image}/>
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
