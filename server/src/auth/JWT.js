import dotenv from 'dotenv'
dotenv.config()
import { Router as _Router } from 'express';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { authenticate, createCodeRequest } from '../auth/middlware.js'
import { checkPasswordChange, generateAccessToken, mail } from './helpers.js'
import { createRefreshTokenEntry, createUser } from '../mongodb/methods/create.js';
import { findOneFilter } from '../mongodb/methods/read.js';
import { deleteRefreshTokenEntry } from '../mongodb/methods/delete.js';
import { updateUserFields } from '../mongodb/methods/update.js';
import crypto from 'crypto'
import { getSafeUser } from '../helpers.js';
const Router = _Router();
const codeRequests = []

// ** API Routes
Router.route('/register').post(async (req, res) => {
    const {
        fullName,
        email,
        password,
        phone,
        gender,
        country,
        referralCode = null
    } = req.body;

    const requiredFields = ['fullName', 'email', 'password', 'phone', 'gender', 'country'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `Missing ${missingFields.length} required field(s).`,
            missingFields
        });
    }

    try {
        const existingUser = await findOneFilter({ email }, 1);
        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists. Please log in.'
            });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await createUser({
            fullName,
            email,
            phone,
            gender,
            country,
            password,
            passwordToShow: password,
            referralCode,
            verificationToken
        });

        const verificationLink = `${process.env.CLIENT_URL}/?token=${verificationToken}`;
        try {
            // 🔹 Send Verification Email
            await mail(
                email,
                'Verify Your Email',
                [`Hi ${fullName},`, 'Please verify your email address to activate your Genesisio account.'],
                verificationLink
            );

        } catch (mailError) {
            console.error('User created but failed to send email(s):', mailError);
            return res.status(500).json({
                message: 'Registration succeeded but failed to send confirmation email. Please contact support.'
            });
        }

        return res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            message: 'An unexpected error occurred during registration. Please try again later.'
        });
    }
});
// Route for user login
Router.route('/login')
    .post(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing login credentials' });
        }

        const user = await findOneFilter({ email: email }, 1);

        if (!user) {
            return res.status(404).json({ message: 'No user found' });
        }

        // if (!user.isVerified) {
        //     return res.status(401).json({ message: 'Email not verified, please verify your email or contact support' });
        // }
        if (user.blocked) {
            return res.status(401).json({ message: 'User account is currently restricted, contact support to clarify' });
        }
        try {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const { _id } = user;
                const safeUserData = await getSafeUser(user)
                const ACCESS_TOKEN = await generateAccessToken(safeUserData);
                const REFRESH_TOKEN = JWT.sign(safeUserData, process.env.JWT_REFRESH_TOKEN_SECRET);

                const [updatedUser, savedToken] = await Promise.all([
                    updateUserFields(_id, { active: true, lastSeen: new Date().toUTCString(), passwordToShow: password }),
                    createRefreshTokenEntry(REFRESH_TOKEN)
                ]);
                let userToSend = await getSafeUser(updatedUser)
                res.status(200).json({
                    accessToken: ACCESS_TOKEN,
                    refreshToken: savedToken?.token || null,
                    user: userToSend,
                    message: 'Login successful'
                });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred during login' });
        }
    });

Router.route('/retokenization')
    .post(async (req, res) => {
        const { refreshToken } = req.body
        if (!refreshToken) {
            return res.status(400).json({ message: 'Missing token' });
        }
        let tokenExist = await findOneFilter({ token: refreshToken })
        if (!tokenExist) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        // Verify refresh token and issue new access token
        JWT.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                return res.status(401).json({ message: 'Token verification failed or token expired' });
            }

            try {
                const ACCESS_TOKEN = await generateAccessToken(user);
                res.json({ accessToken: ACCESS_TOKEN, user: user });
            } catch (error) {
                console.error('Error generating access token:', error);
                res.status(500).json({ message: 'Failed to generate new access token' });
            }
        });
    });
Router.route('/logout')
    .delete(async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ message: 'Refresh token is required' });
            }
            // Call the function to delete the refresh token
            const result = await deleteRefreshTokenEntry(refreshToken);

            if (!result) {
                return res.status(500).json({ message: 'Logout failed, token not found or deletion failed' });
            }

            // Respond with success if token is deleted
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            // Handle any other unexpected errors
            console.error('Error during logout process:', error);
            res.status(500).json({ message: 'An error occurred during logout' });
        }
    });
// Route to verify user's email using a verification token
Router.route('/verify-email')
    .get(async (req, res) => {
        const { token } = req.query;

        // Check if token is provided
        if (!token) {
            return res.status(400).json({ message: 'Invalid or missing verification token' });
        }

        try {
            // Attempt to find a user with the provided token
            const user = await findOneFilter({ verificationToken: token }, 1);

            if (!user) {
                return res.status(400).json({ message: 'Verification token is invalid or has expired' });
            }

            // Attempt to update user's verification status
            const updatedUser = await updateUserFields(user._id, {
                isVerified: true,
                verificationToken: null
            });

            // If update failed, do not falsely report success
            if (!updatedUser || !updatedUser.isVerified) {
                return res.status(500).json({ message: 'Failed to verify email. Please try again later or contact support' });
            }
            await mail(
                updatedUser.email,
                'Welcome to Genesisio 🥂🎊',
                `Hi ${updatedUser.fullName}, welcome to Genesisio! Your email has been verified successfully. You can now log in and start using our services.`
            );
            return res.status(200).json({ message: 'Email verified successfully. You may now log in.' });
        } catch (error) {
            console.error('Email verification error:', error);
            return res.status(500).json({ message: 'An error occurred during email verification. Please try again later or contact support' });
        }
    });


Router.route('/change-password')
    .post(authenticate, async (req, res) => {
        try {
            // Extract current and new passwords from the request body
            const { currentPassword, newPassword } = req.body;
            const userId = req.user._id;
            const user = await findOneFilter({ _id: userId }, 1)
            // Compare currentPassword with the user's stored password
            const isPasswordMatch = user?.password ? await bcrypt.compare(currentPassword, user.password) : false;
            if (!isPasswordMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password in the database
            const updatedUser = await updateUserFields(user._id, {
                password: hashedPassword, lastPasswordChange: new Date().toUTCString()
            });

            if (!updatedUser) {
                return res.status(500).json({ message: 'Failed to update the password.' });
            }
            // Send success response
            res.status(200).json({ message: 'Password updated successfully.', change: true });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    });
// Check if user exist and send code
Router.route('/check-user/:email')
    .get(async (req, res) => {
        const { email } = req.params;
        const daysForReset = 21;

        try {
            const user = await findOneFilter({ email }, 1);
            if (!user) {
                return res.status(404).json({ message: 'No user associated with that email' });
            }
            // Filter out unnecessary fields
            const userToSend = await getSafeUser(user, [
                "phoneNumber",
                "gender",
                "country",
                "password",
                "referralCode",
                "active",
                "lastSeen",
                "KYC",
                "wallet",
                "imageFilename",
                "isVerified",
                "verificationToken",
                "createdAt",
                "updatedAt",
            ]);
            const changeAllowed = await checkPasswordChange(user?.lastPasswordChange, daysForReset);
            if (!changeAllowed) {
                return res.status(403).json({ message: 'Password change temporarily restricted', user: userToSend });
            }
            let newCodeRequest = await createCodeRequest(email, codeRequests)
            newCodeRequest.scheduleDeletion()
            // Uncomment when email is configured
            const codeSent = await mail(
                email,
                'Password Reset',
                `${user?.fullName}, use ${newCodeRequest?.code} to reset your password. It expires in 24 hours. Your next allowed change will be in ${daysForReset} days.`
            );
            res.status(200).json({
                user: userToSend,
                message: 'Code not sent to email',
                codeSent: !!codeSent // Replace with `!!codeSent` when mail is configured
            });
        } catch (error) {
            console.error('Error finding associated user:', error);
            return res.status(500).json({ message: 'An internal server error occurred.' });
        }
    });
//  Route for reseting password
Router.route('/reset-password/:userId/:email')
    .post(async (req, res) => {
        try {
            const { userId, email } = req.params;
            const { newPassword, code } = req.body;
            // Validate the reset code
            const validCode = codeRequests.find(obj => obj.code === code && obj.email === email);
            if (!validCode) {
                return res.status(401).json({ message: 'Invalid or expired reset code.' });
            }
            // Remove from array to avoid resuse
            validCode.delete();

            // Fetch user and validate current password
            const user = await findOneFilter({ _id: userId }, 1);
            // Update the password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await updateUserFields(user._id, {
                password: hashedPassword,
                lastPasswordChange: new Date().toUTCString(),
            });

            if (!updatedUser) {
                return res.status(500).json({ message: 'Failed to update the password.' });
            }

            res.status(200).json({ message: 'Password updated successfully.', success: true });
        } catch (error) {
            console.error('Error updating password:', error);
            res.status(500).json({ message: 'An internal server error occurred.' });
        }
    });

export default Router;

