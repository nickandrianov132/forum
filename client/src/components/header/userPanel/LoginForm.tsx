// import { gql } from '@apollo/client';
import { useApolloClient, useMutation } from '@apollo/client/react';
import React, { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { LOGIN_USER } from '../../../graphql/mutations/loginUser';
import Spinner from '../../Spinner';

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm = ({onClose}: LoginFormProps) => {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [clientError, setClientError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        {/* log in  icon */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 mb-4">
        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
         <h2 className="text-xl font-semibold text-white mb-6">Log in</h2>
         {loading 
            ?
          <Spinner />
            :
          <form className='login-form' onSubmit={handleSubmit} >
          <div className="w-full relative">
            <div className="absolute mb-3 inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <input
              id="login"
              className="form-input"
              type="text" 
              placeholder="Login or Email" 
              value={formData.login}
              onChange={(e) => setFormData({...formData, login: e.target.value})} 
            />
          </div>

          <div className="w-full flex flex-col items-end gap-1.5">
            <div className="w-full relative">
              <div className="absolute mb-3 inset-y-0 left-0 flex items-center pl-2 pointer-events-none text-zinc-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              
              <input
                id="password"
                className="form-input"
                type={showPassword ? "text" : "password"} 
                autoComplete="current-password" 
                placeholder="Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center mb-3 pr-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  /* hide password icon */
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  /* show password icon */
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            
            <a 
              href="#forgot" 
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors px-1"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </div>
            <button className='login-btn' type="submit" disabled={loading}>
              Login
            </button>
          </form>
        }
        {displayError && <span className='text-xs font-medium text-rose-500 mb-2' >{displayError}</span>}
      </div>
    </div>
  );
}

export default LoginForm;
