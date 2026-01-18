import { useEffect, useState } from "react";
import Loader from "./subComponents/Loader.jsx";
import FetchWithAuth from "../auth/api";
import { Card } from "@material-tailwind/react";
import { useNotification } from "../layout/NotificationHelper";
import useAuth from "../auth/useAuth";
import { btcIcon, ethIcon, solanaIcon, usdtIcon, xrpIcon } from "../../assets/icons.jsx";
import { BuildingLibraryIcon } from "@heroicons/react/24/solid";

const Assets = () => {
  const { user } = useAuth();
  const { crypto } = user.wallet || {
    cryptoBalance: 0,
    cryptoAssets: {
      bitcoin: 0,
      ethereum: 0,
      solana: 0,
      tether: 0,
      xrp: 0,
    },
  };
  const [livePrices, setLivePrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const formattedCryptoBalance =
    crypto?.cryptoBalance < 0
      ? `-$${Math.abs(crypto?.cryptoBalance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : `$${crypto?.cryptoBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await FetchWithAuth(
          "/live-prices",
          { method: "GET", credentials: "include" },
          "Failed to fetch live prices"
        );
        if (response.failed) {
          console.error(response.message);
          addNotification(response.message, "error");
        } else {
          const { livePrices, message } = response;
          setLivePrices(livePrices || []);
          addNotification(message, "success");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        addNotification("An error occured while fetching", "error");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const renderIcon = (name) => {
    const iconMap = {
      bitcoin: btcIcon,
      ethereum: ethIcon,
      tether: usdtIcon,
      solana: solanaIcon,
      xrp: xrpIcon,
    };
    return iconMap[name.toLowerCase()] || <BuildingLibraryIcon className='w-5 h-5' />;
  };
  return (
    <Card
      className='text-text-light w-full rounded-lg shadow-md pb-4 bg-primary-default'
    >
      <div className='flex flex-col p-2 min-w-96'>
        <p className='text-lg text-primary-light capitalize'>Crypto Assets</p>
        <p className='font-semibold text-2xl lg:text-4xl py-2 text-white'>
          {formattedCryptoBalance}
        </p>
        <p className='text-sm text-primary-light'>Overview of current assets.</p>
      </div>

      <div className='overflow-x-auto'>
        {loading ? (
          <Loader />
        ) : (
          <table className='w-full text-left text-sm'>
            <thead className='bg-primary-dark'>
              {Object.entries(crypto.cryptoAssets).some(([, amount]) => parseFloat(amount) > 0) && (
                <tr>
                  <th className='p-4'>Sym</th>
                  <th className='p-4'>Asset</th>
                  <th className='p-4'>Holding</th>
                  <th className='p-4'>Equivalent</th>
                  <th className='p-4'>Price</th>
                  <th className='p-4'>Change last hr(%)</th>
                  <th className='p-4'>Change 24 hrs(%)</th>
                  <th className='p-4'>Volume Change 24 hrs(%)</th>
                </tr>
              )}
            </thead>

            <tbody>
              {Object.entries(crypto.cryptoAssets)
                .filter(([, amount]) => parseFloat(amount) > 0)
                .map(([asset, amount]) => {
                  const priceData = livePrices.find(
                    (p) => p.slug.toLowerCase() === asset.toLowerCase()
                  );

                  const usdData = priceData?.quote?.USD;

                  return (
                    <tr key={asset} className='border-b hover:bg-primary-dark'>
                      <td className='p-4 uppercase'>{renderIcon(asset)}</td>
                      <td className='p-4 uppercase'>{asset || "N/A"}</td>
                      <td className='p-4'>{parseFloat(amount).toFixed(2)}</td>
                      <td className='p-4'>
                        $
                        {(parseFloat(amount) * (usdData?.price || 0)).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='p-4'>
                        $
                        {usdData?.price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0.00"}
                      </td>
                      <td
                        className={`p-4 ${
                          usdData?.percent_change_1h > 0 ? "text-success-dark" : "text-error-dark"
                        }`}>
                        {usdData?.percent_change_1h?.toFixed(2) ?? "0.00"}
                      </td>
                      <td
                        className={`p-4 ${
                          usdData?.percent_change_24h > 0 ? "text-success-dark" : "text-error-dark"
                        }`}>
                        {usdData?.percent_change_24h?.toFixed(2) ?? "0.00"}
                      </td>
                      <td
                        className={`p-4 ${
                          usdData?.volume_change_24h > 0 ? "text-success-dark" : "text-error-dark"
                        }`}>
                        {usdData?.volume_change_24h?.toFixed(2) ?? "0.00"}
                      </td>
                    </tr>
                  );
                })}

              {Object.entries(crypto.cryptoAssets).every(
                ([, amount]) => parseFloat(amount) <= 0
              ) && (
                <tr>
                  <td colSpan='8' className='p-4 text-center'>
                    No assets available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default Assets;
