import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { TextInput, Button } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';

export default function SignupScreen() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = React.useState(true);
  const router = useRouter();

  const handleSignup = () => {
    // Here you would handle signup logic
    console.log('Signup attempted with:', name, email, password);
    router.replace('/(auth)/onboarding');
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>GABAY</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Gabay to manage your finances</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon 
              icon={secureTextEntry ? "eye" : "eye-off"} 
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={confirmSecureTextEntry}
          right={
            <TextInput.Icon 
              icon={confirmSecureTextEntry ? "eye" : "eye-off"} 
              onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
            />
          }
        />

        <Button 
          mode="contained" 
          onPress={handleSignup} 
          style={styles.signupButton}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#6200ee',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  signupButton: {
    marginTop: 15,
    borderRadius: 5,
  },
  buttonContent: {
    height: 50,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  footerText: {
    color: '#333',
  },
  loginLink: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
});
