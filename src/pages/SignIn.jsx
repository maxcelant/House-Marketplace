import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { toast } from 'react-toastify';

import { Fragment, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

import OAuth from '../components/OAuth';

export default function SignIn() {

  const navigate = useNavigate();

  const [ showPassword, setShowPassword ] = useState(false);
  const [ formData, setFormData ] = useState({
    email: '',
    password: ''
  });

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if(userCredential.user){
        navigate('/');
      }
    } catch (e) {
      toast.error('Bad User Credentials')
    }
  }

  return (
    <Fragment>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>
        <form onSubmit={onSubmit}>
          <input 
            type="email" 
            className='emailInput' 
            placeholder='Email' 
            id='email' 
            value={email} 
            onChange={onChange}
          />
          <div className="passwordInputDiv">
            <input 
              type={showPassword ? 'text' : 'password'} 
              className='passwordInput' 
              placeholder='Password' 
              id='password' 
              value={password} 
              onChange={onChange}
            />
            <img src={visibilityIcon} alt="show password" className='showPassword' onClick={() => setShowPassword(!showPassword)}/>
          </div>
          <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password</Link>
          <div className="signInBar">
            <p className="signInText">Sign In</p>
            <button className='signInButton'>
              <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
            </button>
          </div>
        </form>

        <OAuth/>

        <Link to='/sign-up' className='registerLink'>Sign Up Instead</Link>
      </div>
    </Fragment>
  )
}
