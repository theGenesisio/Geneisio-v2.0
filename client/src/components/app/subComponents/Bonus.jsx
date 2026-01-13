import { Card } from "@material-tailwind/react";
import useAuth from "../../auth/useAuth";
import { SparklesIcon } from "@heroicons/react/24/solid";

const Bonus = () => {
  const { user } = useAuth();
  return (
    <div className='dashboard-box flex flex-col'>
      <h2 className='font-semibold text-2xl lg:text-3xl flex flex-col'>
        <SparklesIcon className='h-7 w-7 text-success-dark' />
        {`$${parseFloat(user?.wallet?.totalBonus || "0.00").toLocaleString()}`}
      </h2>
      <p className='text-sm text-primary-light'>Bonus</p>
    </div>
  );
};

export default Bonus;
