import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import Spinner from '../components/Spinner'
import ListingItem from '../components/ListingItem'

function Offers() {

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings'); // get reference of listings collection from firestore

        const q = query(
            listingsRef,
            where('offer','==', true), // query listings with either sale or rent
            orderBy('timestamp', 'desc'),
            limit(10)
        );
        // execute query
        const querySnap = await getDocs(q);

        const listings = [];
        
        querySnap.forEach((doc) => { // get data for each listing and put it into local array/list
            return listings.push({
                id: doc.id,
                data: doc.data()
            })
        });

        setListings(listings);
        setLoading(false);

      } catch (e) {
        toast.error('Could not fetch listings')
      }

    }
    fetchListings()
    
  }, [])

  return (
    <div className='category'>
      <header>
        <p className='pageHeader'>
          Offers
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className='categoryListings'>
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {/* lastFetchedListing && (
            <p className='loadMore' onClick={onFetchMoreListings}>
              Load More
            </p>
          )*/}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  )
}

export default Offers