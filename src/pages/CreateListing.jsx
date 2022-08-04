
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db } from '../firebase.config'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

function CreateListing() {

  const [ loading, setLoading ] = useState(false)
  const [ formData, setFormData ] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
  } = formData;

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  useEffect(() => {
    if(isMounted){
        onAuthStateChanged(auth, (user) => {
            if(user) {
                setFormData({...formData, userRef: user.uid}) // add user id to new posting
            } else {
                navigate('/sign-in')
            }
        })
    }
    return () => {
        isMounted.current = false
    }
  }, [isMounted])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if(discountedPrice > regularPrice){
        setLoading(false)
        toast.error('Discounted Price needs to be less than Regular Price')
        return
    }

    if(images.length > 6){
        setLoading(false)
        toast.error('Cannot have more than 6 images')
        return
    }

    let geolocation = {};
    let location;

    // get the lat and lon for the address that was entered
    const { data } = await axios.get(`http://api.positionstack.com/v1/forward?access_key=${process.env.REACT_APP_POSITION_APIKEY}&query=${address}`);
            
    location = data.data[0] ? data.data[0]?.label : undefined
    
    // add lat & lon to geolocation
    geolocation.lat = data.data[0].latitude
    geolocation.lng = data.data[0].longitude

    if(location === undefined || location.includes('undefined')){
        setLoading(false)
        toast.error('Please enter a correct address')
        return
    }

    // store image in firebase
    const storeImage = async (image) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage() // get storage similar to auth
            const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}` // create image name
            const storageRef = ref(storage, 'images/' + fileName) // reference to where it will be stored
            const uploadTask = uploadBytesResumable(storageRef, image) // upload the image

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  console.log('Upload is ' + progress + '% done')
                  switch (snapshot.state) {
                    case 'paused':
                      console.log('Upload is paused')
                      break
                    case 'running':
                      console.log('Upload is running')
                      break
                    default:
                      break
                  }
                },
                (error) => {
                  reject(error)
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                  })
                }
              )
        })
    }

    // uploads each image to Firebase
    const imageUrls = await Promise.all( 
        [...images].map((image) => storeImage(image))
      ).catch(() => {
        setLoading(false)
        toast.error('Images not uploaded')
        return
      })

    const formDataCopy = {
        ...formData,
        imageUrls,
        geolocation,
        timestamp: serverTimestamp()
    }

    delete formDataCopy.images
    delete formDataCopy.address
    location && (formDataCopy.location = location) // if location exists then add it!
    !formDataCopy.offer && (delete formDataCopy.discountedPrice) // if no offer, delete discounted price

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy) // save to firestore
    setLoading(false)
    toast.success('Listing saved')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`) // /catgeory/sale/id
  }

  const onMutate = (e) => {
    let bool = null

    // to set boolean value if it is a boolean 
    if(e.target.value === 'true'){
        bool = true
    }

    if(e.target.value === 'false'){
        bool = false
    }

    // if image file, add those images!
    if(e.target.files){
        setFormData((prevState) => ({
            ...prevState,
            images: e.target.files
        }))
    }

    // for text or boolean fields
    if(!e.target.files){
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: bool ?? e.target.value // if left is false, then use right var
        }))
    }

  }

  if(loading){
    return <Spinner/>
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className='formLabel'>Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Address</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={onMutate}
            required
          />

          <label className='formLabel'>Offer</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Regular Price</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Discounted Price</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing