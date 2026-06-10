import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../hooks/useUser';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;
const isLargeScreen = width > 900;

export const ProfileScreen: React.FC = () => {
  const { user, loading, updateUser, logout } = useUser();
  const router = useRouter();
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const genderOptions = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];

  const handleLogout = async () => {
    Alert.alert('Confirmar saída', 'Tem certeza que deseja sair da aplicação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Feather name="user" size={isSmallScreen ? 40 : 50} color="#6F5AE0" />
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={user.name}
          onChangeText={text => void updateUser({ name: text })}
          placeholder="Seu nome"
          placeholderTextColor="#9C97B9"
        />

        <Text style={styles.label}>Sexo</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setGenderModalVisible(true)}
        >
          <Text style={[styles.selectButtonText, !user.gender && { color: '#9C97B9' }]}>
            {user.gender || 'Selecione seu sexo'}
          </Text>
          <Feather name="chevron-down" size={20} color="#6D42A4" />
        </TouchableOpacity>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert('Sucesso', 'Perfil salvo com sucesso!')}>
            <Feather name="check" size={20} color="white" />
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal para seleção de gênero */}
      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setGenderModalVisible(false)}>
                <Feather name="x" size={24} color="#6F5AE0" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Selecione seu sexo</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalOption,
                    user.gender === option && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    void updateUser({ gender: option });
                    setGenderModalVisible(false);
                  }}
                >
                  {user.gender === option && (
                    <Feather name="check" size={18} color="#6F5AE0" style={{ marginRight: 12 }} />
                  )}
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  scrollContent: {
    padding: isLargeScreen ? 40 : isSmallScreen ? 12 : 24,
    paddingBottom: 40,
    maxWidth: isLargeScreen ? 600 : undefined,
    alignSelf: isLargeScreen ? 'center' : undefined,
    width: isLargeScreen ? '100%' : undefined,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 22 : 28,
    fontWeight: '800',
    color: '#3D2C8D',
    marginTop: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: isSmallScreen ? 16 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: '#4B3D8A',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    height: isSmallScreen ? 44 : 52,
    backgroundColor: '#F9F8FC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(141, 96, 198, 0.16)',
    paddingHorizontal: 16,
    color: '#2B2164',
    fontSize: isSmallScreen ? 14 : 16,
  },
  selectButton: {
    height: isSmallScreen ? 44 : 52,
    backgroundColor: '#F9F8FC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(141, 96, 198, 0.16)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    color: '#2B2164',
    fontSize: isSmallScreen ? 14 : 16,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  inputText: {
    color: '#2B2164',
    fontSize: isSmallScreen ? 14 : 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E3F0',
  },
  modalTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#4B3D8A',
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEFD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionSelected: {
    backgroundColor: '#F5F3FF',
  },
  modalOptionText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#2B2164',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: isSmallScreen ? 8 : 12,
    marginTop: 32,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6F5AE0',
    borderRadius: 18,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6F5AE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 18,
    paddingVertical: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
  },
  loadingText: {
    color: '#6F5AE0',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
  },
});
