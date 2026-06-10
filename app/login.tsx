import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Validação básica
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Simulação de login (pode ser substituído por autenticação real)
    if (email === 'admin' && password === 'admin') {
      router.push('/explore');
    } else {
      Alert.alert('Erro', 'Email ou senha incorretos.');
    }
  };

  return (
    <LinearGradient
      colors={['#CBA8ED', '#B085E5']}
      style={styles.container}
    >
      {/* Background Curvo Superior */}
      <LinearGradient
        colors={['#D4BBF0', '#CBA8ED']}
        style={styles.topCurve}
      />

      <View style={styles.content}>
        {/* Header com Logo e Título */}
        <View style={styles.headerContainer}>
          <View style={styles.logoOuterBorder}>
            <LinearGradient
              colors={['#EADCF8', '#A471E3']}
              style={styles.logoContainer}
            >
              <LinearGradient
                colors={['#9254DC', '#B685E6']}
                style={styles.logoInner}
              >
                <Feather name="check" size={40} color="white" />
              </LinearGradient>
            </LinearGradient>
          </View>
          <Text style={styles.title}>Login</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#A98CCF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A98CCF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#A98CCF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#A98CCF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Botão Entrar */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCurve: {
    position: 'absolute',
    top: -height * 0.15,
    width: width * 1.5,
    height: height * 0.5,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    zIndex: 0,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.1,
    paddingHorizontal: 30,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoOuterBorder: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: 'white',
    marginTop: 24,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4FD',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#6D42A4',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#EBE0F7',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A273DE',
  },
});