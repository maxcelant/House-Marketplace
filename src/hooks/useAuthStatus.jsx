import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStatus = () => {

  const [ loggedIn, setLoggedIn ] = useState(false); // user login state (logged in or not)
  const [ checkingStatus, setCheckingStatus ] = useState(true); // loading spinner
  const isMounted = useRef(true);

  useEffect(() => {
    if(isMounted){
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if(user){
                setLoggedIn(true) // if user is logged in, set it to true
            }
            setCheckingStatus(false) // and make spinner false
        })
    }
    return () => {
        isMounted.current = false;
    }
  }, [isMounted]);

  return { loggedIn, checkingStatus };
}
