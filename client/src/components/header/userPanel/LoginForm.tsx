// import { gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { LOGIN_USER } from '../../../graphql/mutations/loginUser';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm = ({onClose}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [clientError, setClientError] = useState('');
  const [formData, setFormData] = useState({ login: '', password: '' });
  // useMutation возвращает кортеж - функцию для вызова и объект с состоянием
  const [loginMutation, { loading, error: serverError }] = useMutation(LOGIN_USER, {

    /// Переделаный под 2 токена рефреш и auth/refresh токены
    onCompleted: async (data: any) => {
      const { accessToken, refreshToken, user } = data.loginUser;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken')
      await client.clearStore(); 
      // 1. Сохраняем оба токена в LocalStorage для Apollo Links
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 2. В Redux идёт только Access Token и весь объект пользователя
    dispatch(setCredentials({ accessToken, refreshToken, user }));
    onClose();  
    console.log('Saccessfully loged-in.');
    console.log(accessToken);
    },
    onError: (err) => console.error("Log-in error:", err.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.login.trim() || !formData.password.trim()) {
      setClientError("Please, fill-up all fields!")
    }

    await loginMutation({ variables: formData });
    await client.resetStore();
  };

  const displayError = clientError || serverError?.message;

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
            value={formData.login}
            onChange={(e) => setFormData({...formData, login: e.target.value})} 
          />
          <input
            id='password'
            className='form-input' 
            type="password" 
            autoComplete='current-password' // для менеджера паролей
            placeholder="Password" 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <button className='login-btn' type="submit" disabled={loading}>
            {loading ? 'Login...' : 'Login'}
          </button>
          {displayError && <p className='form_error_p' >{displayError}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
