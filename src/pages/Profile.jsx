import { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

export default function Profile() {

  const navigate = useNavigate();
  const auth = getAuth();

  const [ changeDetails, setChangeDetails ] = useState(false);
  const [ formData, setFormData ] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  });

  const { name, email } = formData;

  const onLogout = (e) => {
    auth.signOut();
    navigate('/');
  }

  const onChange = (e) => {
    setFormData((formData) => ({...formData, [e.target.id]: e.target.value}))
  }

  const onSubmit = async () => {
    try {
      if(auth.currentUser.displayName !== name){
        // update display name in Firebase Authentication
        await updateProfile(auth.currentUser, {
          displayName: name
        });

        // update user in Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name
        })
      }
    } catch (e) {
      toast.error('Could not update profile details')
    }
  }

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button className='logOut' onClick={onLogout}>Logout</button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p className="changePersonalDetails" onClick={() => {
            changeDetails && onSubmit();
            setChangeDetails(!changeDetails);
          }}>{ changeDetails ? 'done' : 'change'}</p>
        </div>
        <div className="profileCard">
          <form>
            <input type="text" id="name" className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name} onChange={onChange}/>
            <input type="text" id="email" className={!changeDetails ? 'profileEmail' : 'profileEmailActive'} disabled={!changeDetails} value={email} onChange={onChange}/>
          </form>
        </div>
      </main>
    </div>
  )
}
