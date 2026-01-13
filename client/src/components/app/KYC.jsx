import { useEffect, useRef, useState } from "react";
import { useNotification } from "../layout/NotificationHelper";
import FormError from "./subComponents/FormError";
import Loader from "./subComponents/Loader.jsx";
import useAuth from "./../auth/useAuth";
import { saveUserToLocal } from "../auth/authHelpers";
import { QuestionMarkCircleIcon, CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/solid";
import FetchWithAuth from "../auth/api";
import { formatToNewYorkTime } from "../../assets/helpers.js";
import { Card } from "@material-tailwind/react";
/**
 * The `KYCUpload` component handles the upload and management of KYC documents.
 *
 * Features:
 * - Uploading personal identification documents.
 * - Validating file type and size.
 * - Displaying KYC status.
 *
 * @component
 */
const KYCUpload = () => {
  const { user, setUser } = useAuth();
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { addNotification } = useNotification();
  const [showKYC, setshowKYC] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);
  const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes
  const allowedFileTypes = ["image/png", "image/jpeg"];
  const documentTypes = ["Passport", "Driver's License", "ID Card"];
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [render, setrender] = useState(0);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await FetchWithAuth(
          `/check-kyc/${user?.KYC}`,
          {
            method: "GET",
            credentials: "include",
          },
          "Failed to check KYC status"
        );
        if (response.failed) {
          addNotification(response.message, "error");
        } else {
          const { user: updatedUser, data, message } = response;
          updatedUser && setUser(updatedUser);
          data && setData(data);
          addNotification(message);
        }
      } catch (err) {
        addNotification("An error occurred", "error");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);
  const cancel = () => {
    setError("");
    setFrontFile(null);
    setBackFile(null);
    setSelectedDocumentType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input value
    }
    if (fileInputRef2.current) {
      fileInputRef2.current.value = ""; // Reset the file input value
    }
  };
  const handleFileChange = (e, isBackFile = false) => {
    const selectedFile = e.target.files[0];

    setError("");
    if (!selectedFile) return;

    if (!allowedFileTypes.includes(selectedFile.type)) {
      setError("Only PNG, JPEG files are allowed.");
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setError("File size must be less than 5MB.");
      return;
    }

    if (isBackFile) {
      setBackFile(selectedFile);
    } else {
      setFrontFile(selectedFile);
    }
  };
  const handleUpload = async () => {
    if (!frontFile || !selectedDocumentType) {
      setError("Please select a document type and provide the required file(s).");
      return;
    }

    const formData = new FormData();
    formData.append("images", frontFile);
    if (backFile) formData.append("images", backFile);
    formData.append("documentType", selectedDocumentType);

    try {
      setIsUploading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/img/upload/kyc/${user?._id}/${user?.KYC}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      if (!response.ok) {
        addNotification("Upload failed", "error");
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const { user: updatedUser } = data;
      updatedUser && setUser(updatedUser);
      updatedUser && saveUserToLocal(updatedUser);
      addNotification("Document uploaded successfully", "success");
    } catch (err) {
      addNotification("Upload failed", "error");
      console.error("Upload failed:", err);
      setError("Document upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setFrontFile(null);
      setBackFile(null);
      setSelectedDocumentType("");
      setrender((prev) => prev + 1);
    }
  };
  const checkBackFile = () => {
    if (selectedDocumentType === "Driver's License" || selectedDocumentType === "ID Card") {
      return !!backFile;
    } else if (selectedDocumentType === "Passport") {
      return !backFile;
    }
  };
  const showKYCHandler = () => {
    return setshowKYC((prev) => !prev);
  };
  return (
    <Card className='w-full max-w-4xl profile-box' >
      <h2 className='text-lg font-semibold mb-4 flex justify-between text-text-light'>
        {user?.KYC
          ? data?.state
            ? "KYC Approved"
            : "KYC Awaiting Verification"
          : "Upload Your KYC"}
        <QuestionMarkCircleIcon
          title='Info'
          className='h-5 w-5 hover:scale-110 transition-all delay-100 cursor-help'
          onClick={showKYCHandler}
        />
      </h2>
      {showKYC && (
        <p className='text-sm text-primary-light mb-2'>
          Know Your Customer (KYC) is a process to verify client identities, ensuring compliance,
          preventing fraud, and building trust. By collecting and verifying personal information
          like IDs and addresses, helps us enhance security, comply with regulations, and boost user
          confidence in our services.
        </p>
      )}
      {user?.KYC === data?._id && !data.state && (
        <p className='text-md text-primary-light mb-2'>
          Please allow a few business days for us to thoroughly review the uploaded documents. If
          verification is not completed within five business days, we recommend exploring an
          alternative method for completing your KYC. Kindly note that{" "}
          <span className='highlight'>
            uploading new documents for verification will reset the review period.
          </span>{" "}
          Should the issue persist, please contact our support team for assistance.
        </p>
      )}
      {loading ? (
        <Loader />
      ) : data ? (
        <div>
          <p>
            <strong className='text-primary-light'>Status:</strong>{" "}
            {data?.state ? (
              <span>
                Verified{" "}
                <CheckBadgeIcon className='inline-block w-5 h-5 align-top text-success-light' />
              </span>
            ) : (
              <span>
                Unverified{" "}
                <XCircleIcon className='inline-block w-5 h-5 align-top text-error-light' />
              </span>
            )}
          </p>
          <p>
            <strong className='text-primary-light'>Document used:</strong> {data?.type}
          </p>
          <p>
            <strong className='text-primary-light'>Updated at:</strong>{" "}
            {formatToNewYorkTime(data?.updatedAt)}
          </p>
        </div>
      ) : (
        <p className='text-md text-primary-light mb-2'>
          Please upload your KYC documents to proceed with verification.
        </p>
      )}
      {!data?.state && (
        <form className='flex flex-col space-y-4 mt-5'>
          <select
            className='form-input'
            value={selectedDocumentType}
            onChange={(e) => setSelectedDocumentType(e.target.value)}>
            <option value=''>Select Document Type</option>
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {selectedDocumentType && (
            <input
              type='file'
              className='form-input'
              accept='.png, .jpeg'
              onChange={(e) => handleFileChange(e, false)}
              placeholder='Front Side'
              ref={fileInputRef}
              disabled={selectedDocumentType == ""}
            />
          )}
          {(selectedDocumentType === "Driver's License" || selectedDocumentType === "ID Card") && (
            <input
              type='file'
              className='form-input'
              accept='.png, .jpeg'
              onChange={(e) => handleFileChange(e, true)}
              placeholder='Back Side'
              ref={fileInputRef2}
              disabled={selectedDocumentType == ""}
            />
          )}
          {error && <FormError err={error} />}
          <div className='flex flex-row space-x-4'>
            <button
              className='accent-btn'
              onClick={handleUpload}
              disabled={!frontFile || !selectedDocumentType || isUploading || !checkBackFile()}>
              {isUploading
                ? `Uploading ${selectedDocumentType}...`
                : `Upload ${selectedDocumentType || "Upload document"}`}
            </button>
            <button
              type='button'
              className='danger-btn'
              onClick={cancel}
              hidden={!selectedDocumentType}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default KYCUpload;
