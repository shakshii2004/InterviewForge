import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, profile: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, bio, skills, targetRole, experienceLevel, github, linkedin, profileImage } = req.body;

    user.name = name || user.name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.status(200).json({ success: true, profile: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { theme, emailNotifications } = req.body;

    if (!user.preferences) {
      user.preferences = { theme: 'dark', emailNotifications: true };
    }

    if (theme !== undefined) user.preferences.theme = theme;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;

    const updatedUser = await user.save();

    res.status(200).json({ success: true, preferences: updatedUser.preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
export const changePassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    // Check current password
    const isMatch = await (user as any).matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
