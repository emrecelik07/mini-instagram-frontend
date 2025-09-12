import React, { useContext, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';

export default function VerifyCodePage() {
  const { api, getUserData, setIsLoggedIn } = useContext(AppContext);
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const inputsRef = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setSubmitting(true);
    try {
      if (email) {
        await api.post('/verify-otp-public', { email, otp: otp.trim() });
      } else {
        await api.post('/verify-otp', { otp: otp.trim() });
      }
      toast.success('Verification successful');
      setIsLoggedIn(true);
      await getUserData();
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid or expired code');
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    try {
      if (email) {
        await api.post('/send-otp-public', null, { params: { email } });
      } else {
        await api.post('/send-otp');
      }
      toast.info('A new code has been sent');
    } catch (err) {
      toast.error('Unable to resend code');
    }
  };

  const onInputChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val;
    const nextOtp = (otp + '______').slice(0, 6).split('');
    nextOtp[idx] = val || '';
    const joined = nextOtp.join('').slice(0,6).replace(/_/g, '');
    setOtp(joined);
    if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !e.target.value && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0,6);
    const arr = digits.split('');
    arr.forEach((d, i) => {
      const input = inputsRef.current[i];
      if (input) input.value = d;
    });
    setOtp(digits);
    const nextIndex = Math.min(arr.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(90deg, #83aae6, #5280c7)' }}>
      <div className="p-5 rounded-4 shadow bg-white" style={{ maxWidth: 500, width: '100%' }}>
        <h4 className="text-center fw-bold mb-2">Email Verify One Time Password</h4>
        <p className="text-center mb-4">Enter the 6-digit code sent to your email</p>
        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between gap-2 mb-4">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="form-control text-center fs-4"
                ref={(el) => (inputsRef.current[i] = el)}
                onChange={(e) => onInputChange(e, i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onPaste={onPaste}
              />
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={submitting || otp.trim().length !== 6}>
            {submitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <button className="btn btn-link mt-3 w-100" onClick={resendCode}>
          Resend code
        </button>
      </div>
    </div>
  );
}


