// import { gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { LOGIN_USER } from '../../../graphql/mutations/loginUser';
// import { setToken } from '../../store/slices/authSlice';


// const LOGIN_USER = gql`
//   mutation loginUser($login: String!, $password: String!) {
//     loginUser(login: $login, password: $password) 
//   }
// `;
const LoginForm = () => {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [formData, setFormData] = useState({ login: '', password: '' });
  // useMutation возвращает функцию для вызова и объект с состоянием
  const [loginMutation, { loading, error }] = useMutation(LOGIN_USER, {
    // onCompleted: (data: any) => {
    //   // Сохраняем токен. authLink его увидит при следующем запросе!
    //   console.log(data.loginUser);
    //   dispatch(setToken(data.loginUser))
    //   console.log('Успешный вход!');

    // },
    /// Переделаный под 2 токена рефреш и аус токены
    onCompleted: (data: any) => {
    const { accessToken, refreshToken } = data.loginUser;

    // 1. Сохраняем ОБА токена в LocalStorage для Apollo Links
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // 2. В Redux обычно кладем только Access Token или весь объект пользователя
    // dispatch(setToken(accessToken)); 
    // Один диспатч сделает всё: и в стейт положит, и в localStorage оба токена запишет
  dispatch(setCredentials({ accessToken, refreshToken }));
    
    console.log('Успешный вход! Токены сохранены.');
  },
    onError: (err) => console.error("Ошибка входа:", err.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginMutation({ variables: formData });
    await client.resetStore();
  };

  return (
    <form className='login-form' onSubmit={handleSubmit} >
      <input
        id='login'
        className='form-input' 
        type="text" 
        placeholder="Логин" 
        onChange={(e) => setFormData({...formData, login: e.target.value})} 
      />
      <input
        id='password'
        className='form-input' 
        type="password" 
        placeholder="Пароль" 
        onChange={(e) => setFormData({...formData, password: e.target.value})} 
      />
      <button className='login-btn' type="submit" disabled={loading}>
        {loading ? 'Login...' : 'Login'}
      </button>
      {error && <p className='form_error_p' >{error.message}</p>}
    </form>
  );
}

export default LoginForm;
