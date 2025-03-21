import {View,Text,StyleSheet} from 'react-native';
import { GlobalStyles } from '../constants/styles';

export default function Footer(){
    return(
        <View>
            <Text style={styles.textCopyright}>{'\u00A9'} Justin H Lott, 2025</Text>
        </View>
    )
};

const styles = StyleSheet.create({
  textCopyright: {
    color: GlobalStyles.colors.primary50,
    //fontFamily: 'atma',
    fontSize:9,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 0,
    color: GlobalStyles.colors.primary50,
    textAlign: 'right',
  },
});