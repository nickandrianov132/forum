// import { gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { LOGIN_USER } from '../../../graphql/mutations/loginUser';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm = ({onClose}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [formData, setFormData] = useState({ login: '', password: '' });
  // useMutation возвращает функцию для вызова и объект с состоянием
  const [loginMutation, { loading, error }] = useMutation(LOGIN_USER, {

    /// Переделаный под 2 токена рефреш и аус токены
    onCompleted: (data: any) => {
      const { accessToken, refreshToken, user } = data.loginUser;

      // 1. Сохраняем ОБА токена в LocalStorage для Apollo Links
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 2. В Redux обычно кладем только Access Token или весь объект пользователя
    dispatch(setCredentials({ accessToken, refreshToken, user }));
    onClose();  
    console.log('Успешный вход! Токены сохранены.');
    console.log(accessToken);
    },
    onError: (err) => console.error("Ошибка входа:", err.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginMutation({ variables: formData });
    await client.resetStore();
  };

  return (
    <div className="modal-container" onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <button className='close-btn' onClick={onClose}>x</button>
         <h2 className="text-xl font-semibold text-white mb-6">Войти в аккаунт</h2>
        <form className='login-form' onSubmit={handleSubmit} >
          <input
            id='login'
            className='form-input' 
            type="text" 
            placeholder="Login..." 
            onChange={(e) => setFormData({...formData, login: e.target.value})} 
          />
          <input
            id='password'
            className='form-input' 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <button className='login-btn' type="submit" disabled={loading}>
            {loading ? 'Login...' : 'Login'}
          </button>
          {error && <p className='form_error_p' >{error.message}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
