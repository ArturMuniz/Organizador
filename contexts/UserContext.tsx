import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { RegisteredUser, User } from '../src/types/User';

export interface UserContextType {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateUser: (data: Partial<Pick<User, 'name' | 'gender'>>) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const USER_KEY = 'user_profile';
const REGISTERED_USERS_KEY = 'registered_users';

// NOTE: Para MVP local, as senhas são armazenadas em texto claro no AsyncStorage.
// Em produção, use autenticação segura em backend e nunca salve senhas assim.
const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const getRegisteredUsers = async (): Promise<RegisteredUser[]> => {
  try {
    const stored = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as RegisteredUser[];
  } catch (error) {
    console.error('Error loading registered users:', error);
    return [];
  }
};

const saveRegisteredUsers = async (users: RegisteredUser[]) => {
  try {
    await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving registered users:', error);
    throw error;
  }
};

const updateRegisteredUserProfile = async (email: string, data: Partial<Omit<RegisteredUser, 'email' | 'password'>>) => {
  const users = await getRegisteredUsers();
  const index = users.findIndex((item) => item.email.toLowerCase() === email.toLowerCase());
  if (index < 0) {
    return false;
  }

  users[index] = { ...users[index], ...data };
  await saveRegisteredUsers(users);
  return true;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({ name: '', email: '', gender: '' });
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const persistUser = async (nextUser: User) => {
    setUser(nextUser);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, message: 'Por favor, preencha todos os campos.' };
    }

    const users = await getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const matched = users.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (matched) {
      await persistUser({
        name: matched.name,
        email: matched.email,
        gender: matched.gender ?? '',
      });
      return { success: true };
    }

    if (users.length === 0 && normalizedEmail === 'admin' && password === 'admin') {
      await persistUser({ name: 'Administrador', email: 'admin', gender: '' });
      return { success: true };
    }

    return { success: false, message: 'Email ou senha incorretos.' };
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name.trim()) {
      return { success: false, message: 'Nome obrigatório.' };
    }
    if (!email.trim()) {
      return { success: false, message: 'Email obrigatório.' };
    }
    if (!isValidEmail(email.trim())) {
      return { success: false, message: 'Email inválido.' };
    }
    if (!password.trim() || password.length < 6) {
      return { success: false, message: 'Senha deve ter pelo menos 6 caracteres.' };
    }

    const users = await getRegisteredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const emailExists = users.some((item) => item.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return { success: false, message: 'Email já cadastrado.' };
    }

    const newUser: RegisteredUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      gender: '',
    };

    try {
      await saveRegisteredUsers([...users, newUser]);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Não foi possível salvar o cadastro.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentPassword.trim()) {
      return { success: false, message: 'Senha atual obrigatória.' };
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      return { success: false, message: 'A nova senha deve ter pelo menos 6 caracteres.' };
    }
    if (!user.email) {
      return { success: false, message: 'Usuário não autenticado.' };
    }

    const users = await getRegisteredUsers();
    const index = users.findIndex((item) => item.email.toLowerCase() === user.email.toLowerCase());
    if (index < 0) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    if (users[index].password !== currentPassword) {
      return { success: false, message: 'Senha atual incorreta.' };
    }

    users[index] = { ...users[index], password: newPassword };
    await saveRegisteredUsers(users);
    return { success: true };
  };

  const updateUser = async (data: Partial<Pick<User, 'name' | 'gender'>>) => {
    const nextUser = { ...user, ...data };
    setUser(nextUser);
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      if (user.email) {
        await updateRegisteredUserProfile(user.email, {
          name: nextUser.name,
          gender: nextUser.gender,
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const logout = async () => {
    setUser({ name: '', email: '', gender: '' });
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, login, register, changePassword, updateUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
