import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormError from "./subComponents/FormError"; // Replace with your actual path
// import { isValidPassword } from "../auth/authHelpers";
import { formatToNewYorkTime, getDateAfterDays } from "../../assets/helpers";
import useAuth from "../auth/useAuth";
import FetchWithAuth from "../auth/api";
import { useNotification } from "../layout/NotificationHelper";
import { Card } from "@material-tailwind/react";
/**
 * PasswordReset component allows the user to reset their password.
 * It includes a form to submit the current password, new password,
 * and a confirmation of the new password. The component also manages
 * when the password change is allowed based on the last password change date.
 *
 * It fetches the response from the server to update the password and
 * provides notifications about success or failure.
 *
 * @returns {JSX.Element} The rendered password reset form.
 */
const PasswordReset = () => {
  // Component logic and state management
  /**
   * Handles the password reset form submission.
   * Submits the new password along with the current password to the server.
   * Displays notifications on success or failure.
   *
   * @param {Object} data - Form data containing the current and new passwords.
   */
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const lastPasswordChange = user?.lastPasswordChange || "Jan 1, 2025";
  const [nextChangeAllowed, setNextChangeAllowed] = useState("+21 days");
  const [allowChange, setAllowChange] = useState(false);
  useEffect(() => {
    setNextChangeAllowed(getDateAfterDays(lastPasswordChange, 21));
  }, [lastPasswordChange]);
  useEffect(() => {
    const today = new Date().toISOString(); // Use ISO format for consistent parsing
    if (new Date(today) >= new Date(nextChangeAllowed)) {
      setAllowChange(true); // Allow password change
    } else {
      setAllowChange(false); // Disallow password change
    }
  }, [nextChangeAllowed]);
  const onSubmit = async (data) => {
    const response = await FetchWithAuth(
      `/auth/change-password`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      "Password change failed"
    );
    if (response.failed) {
      addNotification(response.message, "error");
      setTimeout(() => {
        return addNotification(response.failed, "error");
      }, 500);
    }
    // logout
    const { change, message } = response;
    message && addNotification(message, "success");
    setTimeout(() => {
      change && logout();
    }, 1000);
  };
  return (
    <Card
      className='flex flex-col min-h-fit justify-center lg:justify-start profile-box max-w-2xl text-text-light'
      >
      <h2 className='text-xl font-semibold mb-4'>Change your password below.</h2>

      {/* Last Password Change Info */}
      <p className=''>
        Last changed on : <strong>{formatToNewYorkTime(lastPasswordChange)}</strong>
      </p>
      {!allowChange && (
        <p>
          Next change by: <strong>{formatToNewYorkTime(nextChangeAllowed)}</strong>.
        </p>
      )}
      {/* Password Reset Form */}
      <form onSubmit={handleSubmit(onSubmit)} className='mt-5'>
        {/* Current Password Input */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1' htmlFor='current-password'>
            Current Password
          </label>
          <input
            id='current-password'
            type='password'
            disabled={!allowChange}
            className={`form-input w-full ${errors.currentPassword ? "border-error-dark" : ""}`}
            placeholder='Enter your current password'
            {...register("currentPassword", { required: "Current password is required." })}
          />
          {errors.currentPassword && <FormError err={errors.currentPassword.message} />}
        </div>

        {/* New Password Input */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1' htmlFor='new-password'>
            New Password
          </label>
          <input
            id='new-password'
            type='password'
            disabled={!allowChange}
            className={`form-input w-full ${errors.newPassword ? "border-error-dark" : ""}`}
            placeholder='Enter your new password'
            {...register("newPassword", {
              required: "New password is required.",
              validate: {
                // isValidPassword: (value) => isValidPassword(value),
                notSameAsCurrent: (value) =>
                  value !== watch("currentPassword") ||
                  "New password cannot be the same as the current password.",
              },
              minLength: { value: 8, message: "Password must be at least 8 characters long." },
            })}
          />
          {errors.newPassword && <FormError err={errors.newPassword.message} />}
        </div>

        {/* Confirm New Password Input */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-1' htmlFor='confirm-password'>
            Confirm New Password
          </label>
          <input
            id='confirm-password'
            type='password'
            disabled={!allowChange}
            className={`form-input w-full ${errors.confirmPassword ? "border-error-dark" : ""}`}
            placeholder='Confirm your new password'
            {...register("confirmPassword", {
              required: "Please confirm your new password.",
              validate: (value) => value === watch("newPassword") || "Passwords do not match.",
            })}
          />
          {errors.confirmPassword && <FormError err={errors.confirmPassword.message} />}
        </div>

        {/* Submission Button */}
        <button type='submit' className='accent-btn w-full' disabled={!allowChange || isSubmitting}>
          {isSubmitting ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </Card>
  );
};

export default PasswordReset;
