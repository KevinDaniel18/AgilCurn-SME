import { Text, View, StatusBar } from "react-native";
import React, { Component, useEffect, useState } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { CLIENT_ID } from "@env";

export class CalendarScreen extends Component {
  render() {

    const [error, setError] = useState()
    const [userInfo, setUserInfo] = useState()

    function configureGoogleSignIn() {
      GoogleSignin.configure({
        androidClientId: CLIENT_ID,
        scopes: ['https://www.googleapis.com/auth/calendar.events']
      });
    }

    useEffect(()=>{
      configureGoogleSignIn()
    }, [])

    async function signIn(){
      console.log("Pressed sign in");

      try {
        await GoogleSignin.hasPlayServices()
        const userInfo = await GoogleSignin.signIn()
        setUserInfo(userInfo)
        setError()
      } catch (error) {
        setError(error)
      }
    }

    return (
      <View>
        <Text>{JSON.stringify(error)}</Text>
        <Text>{JSON.stringify(userInfo)}</Text>
        <GoogleSigninButton size={GoogleSigninButton.Size.Standard} color={GoogleSigninButton.Color.Dark} onPress={signIn}/>
        <StatusBar style="auto"/>
      </View>
    );
  }
}

export default CalendarScreen;
