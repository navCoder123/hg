import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Verify = () => {

  axios.defaults.withCredentials = true
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext)
  
  const navigate = useNavigate()

  const inputRefs = React.useRef([])

  const handleInputs = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
      }
  }

  const hanldeKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

const handlePaste = (e) => {
  e.preventDefault(); // optional: to avoid default paste behavior
  const paste = e.clipboardData.getData('text').trim();
  const pasteArray = paste.split('');

  pasteArray.forEach((char, index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].value = char; // <-- fixed
    }
  });

  // Optionally, focus next empty input
  const nextEmpty = inputRefs.current.findIndex(input => input.value === '');
  if (nextEmpty !== -1) {
    inputRefs.current[nextEmpty].focus();
  }
  };
  
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { otp })
      
      if (data.success) {
        toast.success(data.message)
        getUserData()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch(error) {
      toast.error(error.message)
    }
  }

useEffect(() => {
  if (isLoggedin && userData?.isAccountVerified) {
    navigate('/');
  }
}, [isLoggedin, userData, navigate]);



  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-[#EEAECA] to-[#94BBE9] box-shadow: 5px 5px 15px 0px rgba(0, 0, 0, 0.3)'>
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-center mb-6 text-indigo-300'>enter 6-digit send in email</h1>
        <div className='flex justify-between mb-8' onPaste={handlePaste}> 
          {Array(6).fill(0).map((_, index) => (
            <input type="text" maxLength='1' key={index} required className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md ' ref={e => inputRefs.current[index] = e}
              onInput={(e) => handleInputs(e, index)}
              onKeyDown={(e) => hanldeKeyDown(e, index)}/>
          ))}
        </div>
        <button className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>VERIFY</button>
      </form>
    </div>
  )
}

export default Verify
