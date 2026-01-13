import { useEffect, useState } from "react";
import CopyTradeCard from "./subComponents/CopyTradeCard";
import { useNotification } from "../layout/NotificationHelper.jsx";
import FetchWithAuth from "../auth/api.js";
import Loader from "./subComponents/Loader.jsx";
const CopyTrade = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [copyTrades, setCopyTrades] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await FetchWithAuth(
          `/copy-trade`,
          { method: "GET", credentials: "include" },
          "Failed to fetch copy trades"
        );
        if (response.failed) {
          addNotification(response.failed, "error");
        } else {
          const { trades, message } = response;
          trades && setCopyTrades(trades.reverse());
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-0'>
      {loading ? (
        <Loader />
      ) : (
        copyTrades.map((trade, index) => <CopyTradeCard key={index} {...trade} />)
      )}
    </div>
  );
};
export default CopyTrade;