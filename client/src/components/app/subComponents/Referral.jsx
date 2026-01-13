import {
  ClipboardDocumentCheckIcon,
  DocumentDuplicateIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useNotification } from "../../layout/NotificationHelper";
import useAuth from "../../auth/useAuth";
import { Card } from "@material-tailwind/react";

const Referral = () => {
  const { user } = useAuth();
  const [copied, setcopied] = useState(false);
  const { addNotification } = useNotification();
  let refLink = "hcauyguiqw/qfqwwegwq";
  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(refLink);
      setcopied(true);
      addNotification("Referral Link copied succesfully", "success");
    } catch (err) {
      console.log(err);
      setcopied(false);
      addNotification("Referral Link not copied, please retry", "warning");
    }
  };
  return (
    <div className='dashboard-box flex flex-col'>
      <h2 className='font-semibold text-2xl lg:text-3xl flex flex-col'>
        <div className='flex flex-row justify-between'>
          <LinkIcon className='h-7 w-7' />
          {copied ? (
            <ClipboardDocumentCheckIcon className='h-7 w-7 text-success-dark' title='Copied' />
          ) : (
            <DocumentDuplicateIcon
              className='h-7 w-7 hover:scale-110 transition-all'
              onClick={copy}
              title='Copy to clipboard'
            />
          )}
        </div>

        {`$${parseFloat(user?.wallet?.referral || "0.00").toLocaleString()}`}
      </h2>
      <p className='text-sm text-primary-light'>Referral Earning</p>
    </div>
  );
};

export default Referral;
