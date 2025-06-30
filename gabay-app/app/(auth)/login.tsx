import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import React, { useState } from 'react';
import { TextInput, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        router.replace('/(tabs)');
      } catch (error) {
        router.navigate('/(tabs)');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <StatusBar style="light" />
          
          <LinearGradient
            colors={['#0070e0', '#0089dc']}
            style={styles.headerGradient}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>G</Text>
            </View>
            <Text style={styles.title}>Welcome to Gabay</Text>
            <Text style={styles.subtitle}>Your financial AI assistant</Text>
          </LinearGradient>

      <View style={styles.formContainer}>
        <TextInput
          label="Mobile Number or Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          outlineColor="#d0d0d0"
          activeOutlineColor="#0070e0"
          theme={{ colors: { onSurfaceVariant: '#555' } }}
        />

        <TextInput
          label="MPIN or Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          outlineColor="#d0d0d0"
          activeOutlineColor="#0070e0"
          theme={{ colors: { onSurfaceVariant: '#555' } }}
          right={
            <TextInput.Icon 
              icon={secureTextEntry ? "eye" : "eye-off"} 
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              color="#0070e0"
            />
          }
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button 
          mode="contained" 
          onPress={handleLogin} 
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
          buttonColor="#0070e0"
          rippleColor="rgba(255,255,255,0.2)"
          labelStyle={styles.buttonLabel}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'LOGGING IN' : 'LOG IN'}
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.signupLink}>Create Account</Text>
          </TouchableOpacity>
        </Link>
      </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerGradient: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logoText: {
    color: '#0070e0',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  formContainer: {
    marginBottom: 25,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#0070e0',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  signupLink: {
    color: '#0070e0',
    fontWeight: '600',
  },
});
