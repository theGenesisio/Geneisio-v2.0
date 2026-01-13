import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { Card, CardBody } from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import WithdrawalAddress from "./subComponents/WithdrawalAddress";
import FormError from "./subComponents/FormError";
import useAuth from "../auth/useAuth";
import FetchWithAuth from "../auth/api";
import { useNotification } from "../layout/NotificationHelper";
import Loader from "./subComponents/Loader";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Withdrawal = () => {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [withdrawalOptions, setWithdrawalOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();
  const [successful, setsuccessful] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      option: "",
      address: "",
    },
  });
  const DEFAULTBANKOPTION = {
    name: "bank",
  };
  const DEFAULTCASHAPPOPTION = {
    name: "cashapp",
  };
  const DEFAULTPAYPALOPTION = {
    name: "paypal",
  };
  const selectedOption = watch("option");
  useEffect(() => {
    successful && navigate("/app/transaction?tab=Withdrawal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successful]);
  useEffect(() => {
    const fetchWithdrawalOptions = async () => {
      setIsLoading(true);
      try {
        const response = await FetchWithAuth(
          "/deposit",
          { method: "GET", credentials: "include" },
          "Failed to fetch withdrawal options"
        );

        if (response.failed) {
          addNotification(response.failed, "error");
        } else {
          setWithdrawalOptions(response.options || []);
          setWithdrawalOptions([
            ...response.options,
            DEFAULTBANKOPTION,
            DEFAULTCASHAPPOPTION,
            DEFAULTPAYPALOPTION,
          ]);
          if (response.message === "Deposit options found") {
            addNotification("Withdrawal options updated");
          }
        }
      } catch (err) {
        addNotification("An error occurred while fetching options", "error");
        console.error("Error fetching withdrawal options:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithdrawalOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWithdrawal = async (data) => {
    setError("");
    try {
      setIsUploading(true);
      setIsLoading(true);
      const response = await FetchWithAuth(
        "/withdrawal",
        { method: "POST", body: JSON.stringify(data) },
        "Failed to send withdrawal request"
      );

      if (response.failed) {
        addNotification(response.message, "error");
        setTimeout(() => {
          return addNotification(response.failed, "error");
        }, 500);
      } else {
        addNotification(response.message, "success");
        setsuccessful(true);
      }
    } catch (error) {
      addNotification("An error occurred", "error");
      setError("An error occurred during withdrawal.");
      console.error("Fetch error:", error);
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      reset(); // Reset form fields after API call is complete
    }
  };

  return (
    <Card  className='w-full md:max-w-md mx-auto md:mx-0'>
      <CardBody className='text-text-light space-y-4 bg-primary-default'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-semibold capitalize'>Withdrawal Request</h2>
          <QuestionMarkCircleIcon
            title='info'
            className='h-7 w-7  hover:scale-110 transition-transform cursor-help'
            onClick={() => setShowPrompt((prev) => !prev)}
          />
        </div>

        <p className='text-lg capitalize'>
          Account Balance:{" "}
          <strong>{`$${parseFloat(user?.wallet?.balance).toLocaleString() || 0}`}</strong>
        </p>

        {showPrompt && (
          <div className='text-sm text-primary-light'>
            <p>
              Withdrawals are fast but must undergo review to ensure anti-fradulent or exploitive
              behaviour.
              <br />
              Multiple requests would be processed as a{" "}
              <span className='highlight'>different case.</span>
              <br />
              We intelligently check for which gateways are currently in working conditions and only
              return those to you.
              <br />
              If your <span className='highlight'>KYC</span> isn&apos;t verified, withdrawal
              wouldn&apos;t be approved
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleWithdrawal)} className='space-y-4'>
          <div>
            <label htmlFor='amount' className='block text-sm font-semibold'>
              Amount
            </label>
            <input
              type='number'
              className='form-input w-full'
              placeholder='$0.00'
              {...register("amount", {
                required: "Amount is required",
                validate: (value) =>
                  value > 0
                    ? value <= user?.wallet?.balance
                      ? true
                      : `Amount exceeds balance by $${(
                          value - user?.wallet?.balance
                        ).toLocaleString()}`
                    : "Amount must be greater than zero ($0)",
              })}
            />
            {errors.amount && <FormError err={errors.amount.message} />}
          </div>

          <div>
            <label htmlFor='option' className='block text-sm font-semibold'>
              Withdrawal Option
            </label>
            <select
              className='form-input w-full'
              {...register("option", { required: "Please select an option" })}>
              <option value='' disabled>
                Select option
              </option>
              {isLoading ? (
                <Loader />
              ) : (
                withdrawalOptions.map((opt) => (
                  <option
                    key={opt._id}
                    value={opt.name}
                    disabled={
                      opt.name === "cashapp" || opt.name === "paypal" || opt.name === "bank"
                    }>
                    {opt.name.toUpperCase()}
                  </option>
                ))
              )}
            </select>
            {errors.option && <FormError err={errors.option.message} />}
          </div>

          {selectedOption && (
            <WithdrawalAddress option={selectedOption} control={control} setValue={setValue} />
          )}

          {error && <FormError err={error} />}
          <button type='submit' className='accent-btn w-full' disabled={isUploading}>
            {isUploading ? "Processing..." : "Request Withdrawal"}
          </button>
        </form>
      </CardBody>
    </Card>
  );
};

export default Withdrawal;
