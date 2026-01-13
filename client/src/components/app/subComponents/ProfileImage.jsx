/**
 * ProfileImageUpload component allows users to upload a new profile image.
 * It handles file selection, validation, and uploading to the server.
 *
 * @component
 * @example
 * return (
 *   <ProfileImageUpload />
 * )
 *
 * @returns {JSX.Element} The ProfileImageUpload component.
 *
 * @function
 * @name ProfileImageUpload
 *
 * @description
 * This component provides a form for users to upload a new profile image.
 * It includes file type and size validation, and displays error messages if the validation fails.
 * The component also handles the upload process and updates the user's profile image upon successful upload.
 *
 * @property {Object} user - The current authenticated user.
 * @property {Function} setUser - Function to update the user state.
 * @property {File|null} file - The selected file for upload.
 * @property {string} error - Error message for file validation or upload failure.
 * @property {boolean} isUploading - Indicates whether the file is currently being uploaded.
 * @property {Function} addNotification - Function to display notifications.
 * @property {Object} fileInputRef - Reference to the file input element.
 *
 * @constant {number} maxFileSize - The maximum allowed file size in bytes (3MB).
 *
 * @function cancel - Resets the file input and error state.
 * @function handleFileChange - Handles file selection and validation.
 * @function handleUpload - Handles the file upload process.
 */
import { useRef, useState } from "react";
import { useNotification } from "../../layout/NotificationHelper";
import FormError from "../subComponents/FormError";
import useAuth from "../../auth/useAuth";
import { saveUserToLocal } from "../../auth/authHelpers";
import { Card } from "@material-tailwind/react";

const ProfileImageUpload = () => {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { addNotification } = useNotification();
  const fileInputRef = useRef(null);

  const maxFileSize = 3 * 1024 * 1024; //3MB in bytes
  const cancel = () => {
    setError("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input value
    }
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    //   Reset error and file state
    setError("");
    setFile(null);

    if (selectedFile) {
      //  Check file type
      if (!["image/png", "image/jpeg"].includes(selectedFile.type)) {
        setError("Only PNG and JPEG files are allowed.");
        return;
      }

      //   Check file size
      if (selectedFile.size > maxFileSize) {
        setError("File size must be less than 3MB.");
        return;
      }

      // If all validations pass, set the file and clear any errors
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    //  Prepare the form data
    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUploading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/img/upload/profile-pic/${user?._id}/${
          user?.imageFilename
        }`,
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
      console.log("Upload successful:", data);
      updatedUser && setUser(updatedUser);
      updatedUser && saveUserToLocal(updatedUser);
    } catch (err) {
      addNotification("Upload failed", "error");
      console.error("Upload failed:", err);
      setError("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input value
      }
      addNotification("Upload successful", "success");
    }
  };
  return (
    <Card className='w-full max-w-4xl profile-box' >
      <h2 className='text-lg font-semibold text-text-light mb-4'>Upload New Profile Image</h2>
      <form className='flex flex-col space-y-4'>
        <input
          type='file'
          className='form-input'
          accept='.png, .jpeg'
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {error && <FormError err={error} />}
        <div className='flex flex-row space-x-4'>
          <button className='accent-btn' onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>
          <button type='button' className='danger-btn' onClick={cancel} hidden={!file}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileImageUpload;
