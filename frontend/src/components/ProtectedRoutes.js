import React from 'react';
import { Navigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const flag = document.cookie
    .split('; ')  // Split cookies into an array by '; ' (each cookie)
    .find(row => row.startsWith('loggedIn='))  // Find the 'loggedIn' cookie
    ?.split('=')[1];
  // console.log(flag);

  if (!flag) {
    return <Navigate to="/login" />;
  }

  // try {
  //   return <Component {...rest} />;
  // } catch (error) {
  //   return <Navigate to="/login" />;
  // }
  return <Component {...rest} />;
};

export default ProtectedRoute;
