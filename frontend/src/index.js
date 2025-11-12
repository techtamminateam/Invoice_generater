import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './login';
import reportWebVitals from './reportWebVitals';

function Rootcompoent(){
const [isLogin, setIsLogin] = React.useState(false);
return (
  <React.StrictMode>
    {isLogin?(<App />):(<Login onLoginSuccess={() => setIsLogin(true)} />)}
  </React.StrictMode>
)
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Rootcompoent/>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
