import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { auth } from '../config/firebase';

// Helper to generate token and set cookie
const generateTokenAndSetCookie = (res: Response, userId: string) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const lowerEmail = email.toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: lowerEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email: lowerEmail,
      password,
      provider: 'local',
      isVerified: false
    });

    if (user) {
      generateTokenAndSetCookie(res, user._id.toString());
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          preferences: user.preferences
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const lowerEmail = email.toLowerCase();

    // Check for user email
    const user = await User.findOne({ email: lowerEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account does not exist.' });
    }

    if (user.provider === 'google' && !user.password) {
      return res.status(401).json({ success: false, message: 'Please sign in with Google.' });
    }

    if (!(await (user as any).matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    generateTokenAndSetCookie(res, user._id.toString());
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profileImage,
        provider: user.provider,
        preferences: user.preferences
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

// @desc    Get user profile (validate session)
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.profileImage,
          provider: user.provider,
          preferences: user.preferences
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate a placeholder reset token
    const resetToken = 'mock_reset_token_123';
    
    // Simulate sending an email
    console.log(`Sending password reset email to ${email} with token: ${resetToken}`);
    
    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    
    // In a real application, verify token against the database here
    if (token !== 'mock_reset_token_123') {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // For mock purposes, just return success since we don't have the email from the token
    // Normally: const user = await User.findOne({ resetToken: token }); user.password = newPassword; await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google Sign In
// @route   POST /api/auth/google
// @access  Public
export const googleSignIn = async (req: Request, res: Response) => {
  try {
    let token = req.body.token;
    
    // Check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'No Google token provided' });
    }

    // Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email' });
    }

    const lowerEmail = email.toLowerCase();
    
    // Check if user exists
    let user = await User.findOne({ email: lowerEmail });

    if (!user) {
      // Create new Google user
      user = await User.create({
        name: name || 'Google User',
        email: lowerEmail,
        provider: 'google',
        profileImage: picture || '',
        isVerified: true
      });
    } else {
      // If user exists but used local, update provider to google if appropriate or just let them in
      // Here we just let them in and update profile image if missing
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save();
      }
    }

    // Generate JWT and set cookie
    generateTokenAndSetCookie(res, user._id.toString());
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profileImage,
        provider: user.provider,
        preferences: user.preferences
      }
    });

  } catch (error: any) {
    console.error('Google Sign-In Error:', error.message || error);
    res.status(401).json({ success: false, message: 'Invalid Google token: ' + (error.message || 'Verification failed') });
  }
};
