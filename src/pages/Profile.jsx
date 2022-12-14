import { useState, useEffect, Fragment } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { updateDoc, doc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

import ListingItem from '../components/ListingItem'
import Spinner from '../components/Spinner';

export default function Profile() {

  const navigate = useNavigate();
  const auth = getAuth();

  const [ listings, setListings ] = useState(null)
  const [ loading, setLoading ] = useState(true)
  const [ changeDetails, setChangeDetails ] = useState(false);
  const [ formData, setFormData ] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  });

  const { name, email } = formData;

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings')
      const q = query(
        listingsRef, 
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      )

      const querySnap = await getDocs(q)
      
      let listings = []
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id, // used for the forEach loop
          data: doc.data() // the actual listing data
        })
      })

      setListings(listings)
      setLoading(false)

    }
    
    fetchUserListings()
  }, [auth.currentUser.uid])

  const onLogout = (e) => {
    auth.signOut();
    navigate('/');
  }

  const onChange = (e) => {
    setFormData((formData) => ({...formData, [e.target.id]: e.target.value}))
  }

  const onDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete?')){
      await deleteDoc(doc(db, 'listings', id))
      const updatedListings = listings.filter((listing) => listing.id !== id) // filter out listing that was just deleted
      setListings(updatedListings)
      toast.success('Successfully deleted Listing')
    }
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

  const onEdit = (id) => {
    navigate(`/edit-listing/${id}`)
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
        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt="Home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrowRight"/>
        </Link>

        {!loading && listings?.length > 0 && (
          <Fragment>
            <p className="listingText">Your Listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing.data} id={listing.id} onDelete={() => onDelete(listing.id)} onEdit={() => onEdit(listing.id)}/>
              ))}
            </ul>
          </Fragment>
        )}

      </main>
    </div>
  )
}
