import { Fragment } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Explore from './pages/Explore';
import Category from "./pages/Category";
import ForgotPassword from './pages/ForgotPassword';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CreateListing from "./pages/CreateListing";

function App() {
  return (
    <Fragment>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Explore/>}/>
        <Route path='/offers' element={<Offers />} />
        <Route path='/category/:categoryName' element={<Category/>}/>
        <Route path='/profile' element={<PrivateRoute/>}>
          <Route path='/profile' element={<Profile/>}/>
        </Route>
        <Route path='/sign-in' element={<SignIn/>}/>
        <Route path='/sign-up' element={<SignUp/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/create-listing' element={<CreateListing/>}/>
      </Routes>
      <Navbar/>
    </BrowserRouter>
    <ToastContainer/>
    </Fragment>
  );
}

export default App;
