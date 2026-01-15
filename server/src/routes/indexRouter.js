import { Router as _Router } from "express";
import { authenticate } from '../auth/middlware.js'
import { findAny, findAnyFilter, findLastCreatedObjects, findNotification, findOneFilter } from '../mongodb/methods/read.js';
import { updateInvestmentRequest, updateNotificationReadBy, updateUpgradeRequest, updateUserFields } from '../mongodb/methods/update.js';
import { getSafeUser } from '../helpers.js';
import { gfsDeposits, uploadDeposits } from './imageRouter.js';
import { createDeposit, createLiveTrade, createWithdrawalRequest } from '../mongodb/methods/create.js';
import { Readable } from 'stream';
import { isValidObjectId } from 'mongoose';
const Router = _Router();
// ** API Routes
Router.route("/dashboard/lastWithdrawal")
    .get(authenticate, async (req, res) => {
        try {
            const withdrawals = await findLastCreatedObjects({ user: req.user._id }, 5, parseInt(1));
            if (!withdrawals || withdrawals.length < 1) {
                return res.status(404).json({ message: 'No withdrawal history found' });
            }
            return res.status(200).json({ message: 'Withdrawal history found', withdrawal: withdrawals[0] });
        } catch (error) {
            console.error('Error in getting last withdrawal:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
Router.route("/dashboard/current-plan")
    .get(authenticate, async (req, res) => {
        try {
            const currentPlan = await findOneFilter({
                "user.email": req.user.email,
                "user.id": req.user._id,
                "status": "active"
            }, 12);
            if (!currentPlan) {
                return res.status(404).json({ message: 'No plan available' });
            }
            return res.status(200).json({ message: 'Plan found', currentPlan });
        } catch (error) {
            console.error('Error in getting currentPlan:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
Router.route("/current-tier")
    .get(authenticate, async (req, res) => {
        try {
            const currentTier = await findOneFilter({
                "user.email": req.user.email,
                "user.id": req.user._id,
            }, 20);
            if (!currentTier) {
                return res.status(404).json({ message: 'Active tier details unavailable' });
            }
            return res.status(200).json({ message: 'Active tier detail available', currentTier });
        } catch (error) {
            console.error('Error in getting currentPlan:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
Router.route("/user")
    .get(authenticate, async (req, res) => {
        try {

            const user = await findOneFilter({ _id: req.user._id }, 1)
            if (!user) {
                return res.status(404).json({ message: 'User not found', user: null });
            }
            const safeUser = await getSafeUser(user)
            return res.status(200).json({
                message: 'User found',
                user: safeUser,
            });
        } catch (error) {
            console.error(`Error fetching user: ${req.user._id}`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
// Checking KYC status
Router.route("/check-kyc/:kycId")
    .get(authenticate, async (req, res) => {
        const kycId = req.params.kycId === "null" ? null : req.params.kycId;
        try {
            if (!kycId) {
                return res.status(404).json({ message: 'No KYC record found' });
            }
            // Validate the kYCId as a MongoDB ObjectId
            if (!isValidObjectId(kycId)) {
                return res.status(400).json({ message: 'Invalid KYC ID format' });
            }

            const kycRecord = await findOneFilter({ _id: kycId }, 2);
            if (!kycRecord) {
                let updatedUser = await updateUserFields({ _id: req.user._id }, { KYC: null })
                const safeUser = await getSafeUser(updatedUser)
                return res.status(404).json({ message: 'KYC record not found', user: safeUser });
            }

            return res.status(200).json({
                message: 'KYC record found',
                data: kycRecord,
                user: req.user,
            });
        } catch (error) {
            console.error(`Error fetching KYC record for ID: ${kycId}`, error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
// Routes for Deposit creation
Router.route('/deposit')
    .post(authenticate, uploadDeposits.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const { option, address, amount, optionRef } = req.body
        const { _id: userId } = req.user
        const fileName = `${userId}_deposit_${Date.now()}`;
        const readableStream = Readable.from(req.file.buffer);

        const uploadStream = gfsDeposits.openUploadStream(fileName, {
            contentType: req.file.mimetype,
        });

        readableStream.pipe(uploadStream)
            .on('error', (err) => {
                console.error('Error uploading deposit:', err);
                res.status(500).json({ message: 'Error uploading file' });
            })
            .on('finish', async () => {
                try {
                    const depositData = {
                        optionRef, option, address, amount, receipt: uploadStream.id, userId
                    }
                    const depositRecord = await createDeposit(depositData)
                    if (!depositRecord) {
                        return res.status(500).json({ message: 'Transaction failed' });
                    }
                    return res.status(200).json({ message: 'Deposit successfull , review ongoing' });
                } catch (error) {
                    console.error('Error in deposit transaction:', error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
            });
    })
    // Deposit options
    .get(authenticate, async (req, res) => {
        try {
            const options = await findAny(3)
            if (!options || options.length < 1) { return res.status(404).json({ message: 'No deposit options currently available, please retry later' }); }
            return res.status(200).json({ message: 'Deposit options found', options: options });
        } catch (error) {
            console.error('Error in getting deposit options:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
// Withdrawal creation
Router.route('/withdrawal')
    .post(authenticate, async (req, res) => {
        const { amount, option, address, bankName, accountName, routingNumber } = req.body;
        const userId = req.user._id;

        try {
            // Assemble withdrawal data
            const withdrawalData = {
                amount,
                option,
                address,
                userId,
                ...(option === 'bank' && { bankName, accountName, routingNumber }) // Include bank fields only for 'bank'
            };

            // Create the withdrawal request
            const withdrawalRequest = await createWithdrawalRequest(withdrawalData);

            // Check if the request failed
            if (!withdrawalRequest) {
                return res.status(400).json({
                    message: 'Withdrawal request failed due to invalid data or server error.',
                });
            }

            // Successful response
            return res.status(200).json({
                message: 'Withdrawal request successful, awaiting confirmation.',
                data: withdrawalRequest,
            });
        } catch (error) {
            console.error('Error in requesting withdrawal:', error);
            return res.status(500).json({
                message: 'An unexpected error occurred while processing your withdrawal request.',
            });
        }
    });
// Transaction History reading
Router.route('/history/:type')
    .get(authenticate, async (req, res) => {
        const { type } = req.params;

        // Validate the type parameter
        if (!['deposit', 'withdrawal', 'livetrade'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid history type. Allowed types are "deposit", "withdrawal" and "livetrade".',
            });
        }
        try {
            const history = await (type === 'livetrade'
                ? findAnyFilter({ 'user.id': req.user._id }, 14)
                : findAnyFilter({ user: req.user._id }, type === 'deposit' ? 4 : 5));
            // Check if history is found
            if (!history || history.length === 0) {
                return res.status(404).json({
                    message: `${type.charAt(0).toUpperCase() + type.slice(1)} history not found.`,
                });
            }

            // Successful response
            return res.status(200).json({
                message: `${type.charAt(0).toUpperCase() + type.slice(1)} history found.`,
                history,
            });
        } catch (error) {
            console.error(`Error in fetching ${type} history data:`, error);
            return res.status(500).json({
                message: `An unexpected error occurred while fetching ${type} history.`,
            });
        }
    });
// Whatsapp
Router.route('/whatsapp')
    .get(authenticate, async (req, res) => {
        try {
            const [number] = await findAny(9) || null
            if (!number) { return res.status(404).json({ message: 'No whatsapp number currently available, please retry later' }); }
            return res.status(200).json({ message: 'Opening whatsapp', number: number?.number });
        } catch (error) {
            console.error('Error in getting current whatsapp number:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
Router.route('/notifications')
    .get(authenticate, async (req, res) => {
        try {
            const notifications = await findNotification(10, req.user._id);
            if (!notifications) {
                return res.status(404).json({ message: 'No notification available' });
            }
            return res.status(200).json({ message: 'Notifications found', notifications });
        } catch (error) {
            console.error('Error in notifications:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
    .put(authenticate, async (req, res) => {
        const { notificationId } = req.body;
        const userId = req.user._id;
        // Validate userId and notificationId
        if (!isValidObjectId(userId) || !isValidObjectId(notificationId)) {
            return res.status(400).json({ message: 'Invalid user or notification ID' });
        }
        try {
            const updatedNotification = await updateNotificationReadBy({ userId, notificationId });
            if (!updatedNotification) {
                return res.status(404).json({ message: 'Notification not found or update failed' });
            }
            return res.status(200).json({ message: 'Notification updated successfully', notification: updatedNotification });
        } catch (error) {
            console.error('Error updating notification readList:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
// Route to handle plan
Router.route('/plans')
    .get(authenticate, async (req, res) => {
        try {
            const plans = await findAny(11);
            if (!plans) {
                return res.status(404).json({ message: 'No plan available' });
            }
            return res.status(200).json({ message: 'Plans found', plans });
        } catch (error) {
            console.error('Error in getting plans:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
Router.route('/investment')
    .post(authenticate, async (req, res) => {
        const { amount, plan, frequency } = req.body;
        const { _id, email } = req.user;
        try {
            const request = await updateInvestmentRequest({ plan, amount, userId: _id, email, frequency });
            if (!request) {
                return res.status(404).json({ message: 'Investment request failed' });
            }
            return res.status(200).json({ message: 'Investment request updated successfully, awaiting confirmation', success: true });
        } catch (error) {
            console.error('Error processing investment request:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
// Route to handle tiers
Router.route('/tiers')
    .get(authenticate, async (req, res) => {
        try {
            const tiers = await findAny(19);
            if (!tiers) {
                return res.status(404).json({ message: 'No upgrade tiers available currently' });
            }
            return res.status(200).json({ message: 'Upgrade tiers found', tiers });
        } catch (error) {
            console.error('Error in getting Upgrade tieru:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
Router.route('/upgrade')
    .post(authenticate, async (req, res) => {
        const { tier } = req.body;
        const { _id, email } = req.user;
        try {
            const request = await updateUpgradeRequest({ tier, userId: _id, email });
            if (!request) {
                return res.status(404).json({ message: 'Upgrade request failed' });
            }
            return res.status(200).json({ message: 'Upgrade request updated successfully, awaiting confirmation', success: true });
        } catch (error) {
            console.error('Error processing upgrade request:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
Router.route('/livetrade')
    .post(authenticate, async (req, res) => {
        const {
            type,
            currencyPair,
            entryPrice,
            stopLoss,
            takeProfit,
            action,
            time
        } = req.body;
        const { _id, email } = req.user;

        // Parse numerical values to ensure they are treated as numbers
        const parsedEntryPrice = parseFloat(entryPrice);
        const parsedStopLoss = parseFloat(stopLoss);
        const parsedTakeProfit = parseFloat(takeProfit);
        const parsedTime = parseFloat(time)
        // Validation logic
        try {
            // 1. Validate required fields
            if (!type || !currencyPair || isNaN(parsedEntryPrice) || isNaN(parsedStopLoss) || isNaN(parsedTakeProfit) || !action) {
                return res.status(400).json({ message: 'All fields are required and must be valid' });
            }

            // 2. Additional validation for entry price and balance (if applicable)
            if (parsedEntryPrice <= 0) {
                return res.status(400).json({ message: 'Entry price must be greater than zero' });
            }

            // 3. Validate action type
            if (action !== 'buy' && action !== 'sell') {
                return res.status(400).json({ message: 'Action must be either "buy" or "sell"' });
            }

            // 4. Custom validation based on action type
            if (action === 'buy') {
                if (parsedStopLoss >= parsedEntryPrice) {
                    return res.status(400).json({ message: 'Stop loss must be below entry price for a buy trade' });
                }
                if (parsedTakeProfit <= parsedEntryPrice) {
                    return res.status(400).json({ message: 'Take profit must be above entry price for a buy trade' });
                }
            } else if (action === 'sell') {
                if (parsedStopLoss <= parsedEntryPrice) {
                    return res.status(400).json({ message: 'Stop loss must be above entry price for a sell trade' });
                }
                if (parsedTakeProfit >= parsedEntryPrice) {
                    return res.status(400).json({ message: 'Take profit must be below entry price for a sell trade' });
                }
            }

            // 5. If validations pass, create the live trade
            const details = {
                type,
                currencyPair,
                entryPrice: parsedEntryPrice,
                stopLoss: parsedStopLoss,
                takeProfit: parsedTakeProfit,
                action,
                time: parsedTime
            };

            // Create live trade with the validated data
            const livetrade = await createLiveTrade({ details, userId: _id, email });

            // Check if the live trade was created successfully
            if (!livetrade) {
                return res.status(404).json({ message: 'Live trade failed' });
            }

            // Respond with a success message if the trade was created
            return res.status(200).json({ message: 'Live trade running', success: true });
        } catch (error) {
            // Catch any unexpected errors and log them
            console.error('Error processing live trade:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });
Router.route('/copy-trade')
    .get(authenticate, async (req, res) => {
        try {
            const trades = await findAny(17);
            if (!trades || trades.length < 1) {
                return res.status(404).json({ message: 'No trades currently available, Please try again later' });
            }
            return res.status(200).json({ message: 'Trades found', trades });
        } catch (error) {
            console.error('Error in getting trades:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
Router.route('/live-prices')
    .get(authenticate, async (req, res) => {
        try {
            const livePrices = await findAny(18);
            if (!livePrices || livePrices.length < 1) {
                return res.status(404).json({ message: 'Live data currently unavailable, Please try again later' });
            }
            return res.status(200).json({ message: 'Live data loaded', livePrices });
        } catch (error) {
            console.error('Error in getting live data:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    })
export default Router;