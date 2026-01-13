import ProfileImage from "./subComponents/ProfileImage";
import Profilepic from "./subComponents/Profilepic";
import useAuth from "../auth/useAuth";
import { Placeholder10 } from "../../assets/utilities";
import FetchWithAuth from "../auth/api";
import { useEffect, useState } from "react";
import { useNotification } from "../layout/NotificationHelper";
import { CheckBadgeIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Card } from "@material-tailwind/react";
import { formatToNewYorkTime } from "../../assets/helpers";
/**
 * ProfilePage component displays the user's profile information.
 * It fetches the user's KYC status and updates the profile accordingly.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * return (
 *   <ProfilePage />
 * )
 *
 * @description
 * The ProfilePage component uses the `useAuth` hook to get the current user and the `useNotification` hook to display notifications.
 * It fetches the KYC status of the user on mount and updates the user and data state accordingly.
 * The component displays the user's profile picture, personal information, and account information.
 * It also includes a section for uploading a profile image.
 */
const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const [data, setData] = useState(null);

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
  }, []);
  return (
    <div className='min-h-screen flex flex-col space-y-4'>
      {/* Header */}
      <Card className='w-full max-w-4xl profile-box relative' >
        {user?.imageFilename ? (
          <Profilepic />
        ) : (
          <div className='absolute -top-5 left-6'>
            <img
              src={Placeholder10}
              alt='Profile picture'
              className='w-24 h-24 rounded-lg shadow-lg hover:scale-105 transition-all duration-500 ease-in-out delay-100'
            />
          </div>
        )}
        {/* User Information */}
        <div className='ml-32'>
          <h1 className='text-2xl font-bold text-text-light'>{user?.fullName}</h1>
          <p className='text-sm text-primary-light capitalize'>
            {user?.gender} | {user?.country}
          </p>
        </div>
      </Card>

      {/* Main Section */}
      <div className='w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Personal Info Section */}
        <Card className='profile-box' >
          <h2 className='text-lg font-semibold text-text-light mb-4'>Personal Info</h2>
          <div className='space-y-4'>
            <p>
              <strong className='text-primary-light'>Email:</strong> {user?.email}
            </p>
            <p>
              <strong className='text-primary-light'>Phone Number:</strong> {user?.phoneNumber}
            </p>
            <p>
              <strong className='text-primary-light'>Country:</strong> {user?.country}
            </p>
            <p className='capitalize'>
              <strong className='text-primary-light'>Gender:</strong> {user?.gender}
            </p>
          </div>
        </Card>

        {/* Account Info Section */}
        <Card className='profile-box' >
          <h2 className='text-lg font-semibold text-text-light mb-4'>Account Info</h2>
          <div className='space-y-4'>
            <p>
              <strong className='text-primary-light'>Account Status:</strong>{" "}
              {user?.active ? "Active" : "Inactive"}
            </p>
            <p>
              <strong className='text-primary-light'>Registered:</strong>{" "}
              {formatToNewYorkTime(user?.createdAt)}
            </p>
            {user?.lastSeen && (
              <p>
                <strong className='text-primary-light'>Last Seen:</strong>{" "}
                {formatToNewYorkTime(user.lastSeen)}
              </p>
            )}
            {loading ? (
              <p>
                <strong className='text-primary-light'>KYC Status:</strong> Checking status...
              </p>
            ) : (
              <p>
                <strong className='text-primary-light'>KYC Status:</strong>{" "}
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
            )}
          </div>
        </Card>
        {/* Upload Section */}
        <ProfileImage />
      </div>
    </div>
  );
};

// Render Example
export default ProfilePage;
