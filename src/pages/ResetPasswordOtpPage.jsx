import {Link, useNavigate} from "react-router-dom";
import {assets} from "../assets/assets.js";
import {useContext, useEffect, useRef, useState} from "react";
import {AppContext} from "../content/AppContext.jsx";
import axios from "axios";
import {toast} from "react-toastify";

function ResetPasswordOtpPage() {
    const inputsRef = useRef([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
    const {getUserData, isLoggedIn, userData, backendURL} =
        useContext(AppContext);

    axios.defaults.withCredentials = true;

    const handleInputChange = (e, i) => {
        const value = e.target.value;
        if (!/^\d$/.test(value)) return;

        if (value && i < 5) {
            inputsRef.current[i + 1].focus();
        }
    };

    const handleKeyDown = (e, i) => {
        if (e.key === "Backspace" && !e.target.value && i > 0) {
            inputsRef.current[i - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const paste = e.clipboardData.getData("text");
        const digits = paste.replace(/\D/g, "").slice(0, 6);

        digits.split("").forEach((d, idx) => {
            inputsRef.current[idx].value = d;
        });

        const nextIndex = digits.length >= 6 ? 5 : digits.length;
        inputsRef.current[nextIndex]?.focus();
    };

    const handleVerify = async () => {
        try {
            setLoading(true);
            const enteredOtp = inputsRef.current
                .map((input) => input?.value ?? "")
                .join("");
            setOtp(enteredOtp);
            console.log("Verifying OTP:", enteredOtp);

            setIsOtpSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitEmail = async (e) => {
        e.preventDefault();
        setLoading(true);

        try{
            const response = await axios.post(`${backendURL}/send-reset-otp?email=${email}`);
            if(response.status === 200){
                toast.success("Email sent successfully!");
                setIsEmailSent(true);
            } else {
                toast.error("Something went wrong, please try again");
            }
        }catch(error){
            toast.error(error.message);
        }finally {
            setLoading(false);
        }
    };

    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${backendURL}/reset-password`, {
                email,
                otp,
                newPassword
            });
            if(response.status === 200){
                toast.success("Password reset successful!");
                navigate("/login");
            } else{
                toast.error("Something went wrong, please try again");
            }
        }catch(error){
            toast.error(error.message);
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const ok = localStorage.getItem('resetFlow') === 'started';
        if (!ok) navigate('/login', { replace: true });
        return () => localStorage.removeItem('resetFlow');
    }, []);

    return (
        <div
            className={
                "d-flex align-items-center justify-content-center vh-100 position-relative"
            }
            style={{
                background: "linear-gradient(90deg, #83aae6, #5280c7)",
                border: "none",
            }}
        >
            <Link
                to="/"
                className={
                    "position-absolute top-0 start-0 p-4 d-flex align-items-center gap-2 text-decoration-none"
                }
            >
                <img src={assets.logo} alt="logo" height={32} width={32}/>
                <span className="fs-4 fw-semibold text-light">Ministagram</span>
            </Link>

            {!isEmailSent && (
                <div
                    className={"rounded-4 p-5 text-center bg-white"}
                    style={{width: "100%", maxWidth: "400px"}}
                >
                    <h4 className={"mb-2"}>Reset Password</h4>
                    <p className={"mb-4"}>Enter your registered email address</p>
                    <form onSubmit={onSubmitEmail}>
                        <div className="mb-4 input-group rounded-pill bg-white shadow-sm">
                            <span className="input-group-text bg-transparent border-0 ps-4">
                                <i className="bi bi-envelope" />
                            </span>
                            <input
                                type="email"
                                className="form-control border-0 ps-1 pe-4 rounded-end bg-transparent"
                                placeholder="Enter your email address"
                                style={{ height: '50px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
            )}

            {!isOtpSubmitted && isEmailSent && (
                <div
                    className="p-5 rounded-4 shadow bg-white"
                    style={{maxWidth: "500px"}}
                >
                    <h4 className={"text-center fw-bold mb-2"}>
                        Email Verify One Time Password
                    </h4>
                    <p className={"text-center mb-4"}>
                        Enter the 6-digit code sent to your email
                    </p>
                    <div className="d-flex justify-content-between gap-2 mb-4 text-center text-white-50 mb-2">
                        {[...Array(6)].map((_, i) => (
                            <input
                                key={i}
                                type="text"
                                maxLength={1}
                                className="form-control text-center fs-4 otp-input"
                                ref={(el) => (inputsRef.current[i] = el)}
                                onChange={(e) => handleInputChange(e, i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>
                    <button
                        className="btn btn-primary w-100 fw-semibold"
                        disabled={loading}
                        onClick={handleVerify}
                    >
                        {loading ? "Verifying..." : "Verify Email"}
                    </button>
                </div>
            )}

            {isOtpSubmitted && isEmailSent && (
                <div className={"rounded-4 p-4 text-center bg-white"} style={{width: "100%", maxWidth: "400px"}}>
                    <h4 className={"text-center fw-bold mb-2"}>New Password</h4>
                    <p className={"text-center mb-4"}>Enter the new password below</p>
                    <form onSubmit={onSubmitNewPassword}>
                        <div className="mb-4 input-group rounded-pill  shadow-sm">
                            <span className="input-group-text bg-transparent border-0 ps-4">
                                <i className={"bi bi-person-fill-lock"}></i>
                            </span>
                            <input
                                type={"password"}
                                className="form-control border-0 ps-1 pe-4"
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                                required
                            />
                        </div>
                        <button className="btn btn-primary w-100 py-2" type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ResetPasswordOtpPage;
