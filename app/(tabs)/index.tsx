import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    // Navega para a tela de login. 
    // Certifique-se de criar o arquivo app/login.tsx futuramente
    router.push('/login'); 
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
          <Text style={styles.title}>Organiza A.I</Text>
        </View>

        {/* Textos Centrais e Ícone */}
        <View style={styles.middleContainer}>
          <Text style={styles.subtitle}>
            Organize sua{'\n'}vida com{'\n'}inteligência!
          </Text>
          <View style={styles.messageIconContainer}>
            <Feather name="message-square" size={40} color="rgba(255, 255, 255, 0.9)" />
            <View style={styles.checkIconOverlay}>
              <Feather name="check" size={16} color="rgba(255, 255, 255, 0.9)" />
            </View>
          </View>
        </View>

        {/* Botão Começar */}
        <TouchableOpacity 
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleStart}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
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
  middleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  messageIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
  },
  checkIconOverlay: {
    position: 'absolute',
    top: 10, // Ajuste para centralizar o check dentro do balão de mensagem
  },
  button: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#EBE0F7',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#A273DE',
  },
});