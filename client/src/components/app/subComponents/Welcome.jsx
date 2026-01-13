import { UserIcon } from "@heroicons/react/24/solid";
import { WelcomeIllustration } from "../../../assets/utilities";
import useAuth from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@material-tailwind/react";
/**
 * Welcome component displays a user's account information and provides an option to deposit funds.
 *
 * @component
 * @example
 * return (
 *   <Welcome />
 * )
 *
 * @returns {JSX.Element} A card component with user information and a deposit button.
 *
 * @description
 * This component uses the `useAuth` hook to get the current user's information and the `useNavigate` hook to navigate to the deposit page.
 * It displays the user's full name, account balance, and a button to deposit funds. It also includes an illustration on the right side.
 */
const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profit = parseFloat(user?.wallet?.balance || "0.00");
  const profitFluctuation = parseFloat(user?.wallet?.fluctuation || "0.00");
  const formattedBalance =
    profit < 0
      ? `-$${Math.abs(profit).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : `$${profit.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  return (
    <div className='dashboard-box flex flex-row relative !p-0'>
      <div className='w-2/3 p-4'>
        <UserIcon className='h-7 w-7' />
        <h1 className='font-semibold text-xl'>{user?.fullName || "Customer"}</h1>
        <p className='text-sm text-primary-light capitalize'>Account Balance</p>
        <p className='font-semibold text-2xl lg:text-4xl py-2 text-white'>
          {formattedBalance}
          {profitFluctuation !== 0 && (
            <sup
              className={`text-sm ${
                profitFluctuation > 0 ? "text-success-dark" : "text-error-dark"
              }`}>
              {`${parseFloat(profitFluctuation || "0.00").toLocaleString()}%`}
            </sup>
          )}
        </p>
        <button className='accent-btn w-3/4 mt-5 lg:mt-40' onClick={() => navigate("/app/deposit")}>
          deposit funds
        </button>
      </div>
      <div className='w-1/3 relative'>
        <img
          src={WelcomeIllustration}
          alt='illustration'
          className='absolute bottom-0 right-0 object-contain w-full'
        />
      </div>
    </div>
  );
};

export default Welcome;
