// import { gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { setToken } from '../../store/slices/authSlice';
import { LOGIN_USER } from '../../graphql/mutations/loginUser';


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
    onCompleted: (data: any) => {
      // Сохраняем токен. authLink его увидит при следующем запросе!
      console.log(data.loginUser);
      dispatch(setToken(data.loginUser))
      console.log('Успешный вход!');

    },
    onError: (err) => console.error("Ошибка входа:", err.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginMutation({ variables: formData });
    await client.resetStore();
  };

  return (
    <form className='login_form' onSubmit={handleSubmit} >
      <input
        className='form_input' 
        type="text" 
        placeholder="Логин" 
        onChange={(e) => setFormData({...formData, login: e.target.value})} 
      />
      <input
        className='form_input' 
        type="password" 
        placeholder="Пароль" 
        onChange={(e) => setFormData({...formData, password: e.target.value})} 
      />
      <button className='login_btn' type="submit" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>
      {error && <p className='form_error_p' >{error.message}</p>}
    </form>
  );
}

export default LoginForm;
