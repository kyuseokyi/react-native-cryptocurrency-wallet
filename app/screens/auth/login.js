import React, {Component} from 'react'
import {
    View,
    Alert,
    AsyncStorage,
    ScrollView,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableHighlight,
    Text
} from 'react-native'
import AuthService from './../../services/authService'
import UserInfoService from './../../services/userInfoService'
import Auth from './../../util/auth'
import ResetNavigation from './../../util/resetNavigation'
import TextInput from './../../components/textInput'
import Colors from './../../config/colors'
import Constants from './../../config/constants'
import Header from './../../components/header'

export default class Login extends Component {
    static navigationOptions = {
        title: 'Login',
    }

    constructor(props) {
        super(props)
        this.checkLoggedIn()
        this.state = {
            email: '',
            company: Constants.company_id,
            password: '',
        }
    }

    checkLoggedIn = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            if (token != null) {
                ResetNavigation.dispatchToSingleRoute(this.props.navigation, "Home")
            }
            return token
        } catch (error) {
        }
    }

    login = async () => {
        var body = {
            "email": this.state.email,
            "password": this.state.password,
        }
        let responseJson = await AuthService.login(body)
        if (responseJson.status === "success") {
            const loginInfo = responseJson.data
            await AsyncStorage.setItem("token", loginInfo.token)
            let userDetails = await UserInfoService.getUserDetails()
            if (userDetails.status === "success") {
                const authInfo = userDetails.data
                if (authInfo.isMfaEnabled === true) {
                    this.props.navigation.navigate("AuthVerifySms", {loginInfo:loginInfo,isTwoFactor:true})
                }
                else {
                    Auth.login(this.props.navigation, loginInfo)
                }
            }
            else {
                Alert.alert('Error',
                    userDetails.message,
                    [{text: 'OK'}])
            }
        }
        else {
            Alert.alert('Error',
                responseJson.message,
                [{text: 'OK'}])
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Header
                    navigation={this.props.navigation}
                    back
                    title="Login"
                />
                <View style={styles.mainContainer}>
                    <KeyboardAvoidingView style={styles.container} behavior={'padding'} keyboardVerticalOffset={85}>
                        <ScrollView keyboardDismissMode={'interactive'}>
                            <TextInput
                                title="Email"
                                autoCapitalize="none"
                                placeholder="e.g john@gmail.com"
                                keyboardType="email-address"
                                value={this.state.email}
                                underlineColorAndroid="white"
                                onChangeText={(email) => this.setState({email})}
                            />
                            <TextInput
                                title="Password"
                                autoCapitalize="none"
                                placeholder="Password"
                                underlineColorAndroid="white"
                                secureTextEntry
                                value={this.state.password}
                                onChangeText={(password) => this.setState({password})}
                            />
                        </ScrollView>
                        <TouchableHighlight
                            style={styles.login}
                            onPress={this.login}>
                            <Text style={{color: 'white',fontSize:20}}>
                                Login
                            </Text>
                        </TouchableHighlight>
                    </KeyboardAvoidingView>
                    <TouchableHighlight
                        style={styles.forgetPassword}
                        onPress={() => this.props.navigation.navigate("ForgetPassword")}>
                        <Text style={{color: Colors.blue}}>
                            Forgot Password?
                        </Text>
                    </TouchableHighlight>
                    <View style={{height:130,backgroundColor:'white'}}/>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 10,
        justifyContent:'flex-start'
    },
    container: {
        flex:1,
        paddingTop:10,
    },
    login: {
        marginTop: 10,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.blue,
        marginHorizontal:10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom:10
    },
    forgetPassword: {
        padding: 10,
        height: 50,
        backgroundColor: 'white',
        width: "100%",
        borderColor: Colors.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
