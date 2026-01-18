import { useEffect, useState, useMemo } from "react";
import { formatToNewYorkTime } from "../../../assets/helpers.js";
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/solid";
import FetchWithAuth from "../../auth/api.js";
import { useNotification } from "../../layout/NotificationHelper";
import Loader from "./Loader.jsx";
import { Card } from "@material-tailwind/react";
/**
 * Fetches the user's withdrawal history from the server.
 * Updates the transaction state with the fetched data and handles errors or notifications.
 * @async
 * @function
 * @returns {Promise<void>}
 */

/**
 * Updates the number of items displayed per page based on the current window size.
 * Adjusts for different screen sizes (mobile, tablet, desktop).
 * @function
 * @returns {void}
 */

/**
 * Filters and paginates the transaction data based on the search query, filter status, and current page.
 * Updates the paginated transactions and total items states.
 * @function
 * @returns {void}
 */

/**
 * Navigates to the next page of paginated transactions if more pages are available.
 * Increments the current page state.
 * @function
 * @returns {void}
 */

/**
 * Navigates to the previous page of paginated transactions if the current page is greater than 1.
 * Decrements the current page state.
 * @function
 * @returns {void}
 */

const WithdrawalHistoryTable = () => {
  const { addNotification } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await FetchWithAuth(
          `/history/withdrawal`,
          { method: "GET", credentials: "include" },
          "Failed to fetch withdrawal history"
        );
        if (response.failed) {
          addNotification(response.failed, "error");
        } else {
          const { history, message } = response;
          history && setTransactions(history.reverse());
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

  const updateItemsPerPage = () => {
    const width = window.innerWidth;
    if (width >= 1200) setItemsPerPage(12);
    else if (width >= 768) setItemsPerPage(10);
    else setItemsPerPage(8);
  };

  useEffect(() => {
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = !searchQuery || transaction._id.includes(searchQuery);
      const matchesStatus = !filterStatus || transaction.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, filterStatus]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Card className='text-text-light w-full rounded-lg shadow-md bg-primary-default'>
      <div className='flex flex-wrap justify-between items-center p-2 min-w-96'>
        <div>
          <h3 className='text-lg font-semibold'>Withdrawal History</h3>
          <p className='text-sm text-primary-light'>Overview of your transactions.</p>
        </div>
        <div className='mt-3 sm:mt-0'>
          <div className='relative w-full max-w-sm'>
            <input
              type='text'
              placeholder='Search by Transaction ID'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full form-input'
            />
            <MagnifyingGlassIcon className='w-4 h-4 absolute top-1/2 right-3 transform -translate-y-1/2 text-primary-light' />
          </div>
        </div>
      </div>

      <div className='flex justify-start items-center space-x-4 px-4 py-2'>
        {["pending", "completed", "failed"].map((status) => (
          <label key={status} className='inline-flex items-center space-x-2'>
            <input
              type='radio'
              name='status-filter'
              value={status}
              checked={filterStatus === status}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='text-primary-light focus:ring-primary-light'
            />
            <span className='text-sm capitalize'>{status}</span>
          </label>
        ))}
        <TrashIcon
          title='Clear filters'
          className='w-4 h-4 text-primary-light hover:scale-105 transition-all delay-100 hover:text-error-light duration-500'
          onClick={() => {
            setFilterStatus("");
            setSearchQuery("");
          }}
        />
      </div>

      <div className='overflow-x-auto'>
        {loading ? (
          <Loader />
        ) : (
          <table className='w-full text-left text-sm'>
            <thead className='bg-primary-dark'>
              <tr>
                <th className='p-4'>Transaction ID</th>
                <th className='p-4'>Option</th>
                <th className='p-4'>Amount ($)</th>
                <th className='p-4 min-w-[12rem]'>Bank Name</th>
                <th className='p-4 min-w-[12rem]'>Account Name</th>
                <th className='p-4'>Status</th>
                <th className='p-4 min-w-[16rem]'>Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction._id} className='border-b hover:bg-primary-dark'>
                  <td className='p-4'>{transaction._id}</td>
                  <td className='p-4 capitalize'>{transaction.option}</td>
                  <td className='p-4'>${transaction.amount.toLocaleString()}</td>
                  <td className='p-4 min-w-[12rem]'>
                    {transaction.bankDetails?.bankName || "N/A"}
                  </td>
                  <td className='p-4 min-w-[12rem]'>
                    {transaction.bankDetails?.accountName || "N/A"}
                  </td>
                  <td className='p-4 capitalize'>{transaction.status}</td>
                  <td className='p-4 min-w-[16rem]'>
                    {formatToNewYorkTime(transaction.createdAt)}
                  </td>
                </tr>
              ))}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan='7' className='p-4 text-center'>
                    No transactions found. Keep an eye out as your financial portfolio grows!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className='flex justify-between items-center p-4'>
        <p className='text-sm'>
          Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b>-
          <b>{Math.min(currentPage * itemsPerPage, totalItems)}</b> of <b>{totalItems}</b>
        </p>
        <div className='flex space-x-2'>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className='px-3 py-1 text-sm bg-transparent border rounded hover:bg-gray-200'
            disabled={currentPage === 1}>
            Prev
          </button>
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => setCurrentPage(page + 1)}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === page + 1
                  ? "text-white bg-primary-light"
                  : "bg-transparent hover:bg-gray-200"
              }`}>
              {page + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className='px-3 py-1 text-sm bg-transparent border rounded hover:bg-gray-200'
            disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WithdrawalHistoryTable;
