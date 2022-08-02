import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import Spinner from './Spinner';

const PrivateRoute = () => {

  const { loggedIn, checkingStatus } = useAuthStatus();

  if(checkingStatus){
    return <Spinner/>
  }

  // Outlet is means go to the nested child route 
  return loggedIn ? <Outlet/> : <Navigate to='/sign-in'/>
}

export default PrivateRoute