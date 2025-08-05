import {useEffect} from "react";
import { createPortal } from 'react-dom';


const TermsModal = ({ onClose }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);


    return createPortal(
        (
            <div
                className="position-fixed top-0 start-0 vw-100 vh-100 d-flex align-items-center justify-content-center"
                style={{ background: "rgba(0,0,0,.65)", zIndex: 1050 }}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="bg-white rounded-3 shadow-lg p-4"
                    style={{ width: "90vw", maxWidth: "1200px", maxHeight: "80vh", overflowY: "auto" }}
                >
                    <h3 className="mb-3">Terms &amp; Conditions</h3>
                    <iframe src="/terms.html" title="terms" style={{ border: 0, width: '100%', height: 'calc(80vh - 130px)' }} />
                    <div className="text-end mt-3">
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        ),
        document.body
    );

}

export default TermsModal;
