import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/index.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure Google OAuth Strategy (lazy initialization)
let googleStrategyInitialized = false;

const initializeGoogleStrategy = () => {
  if (googleStrategyInitialized) return;
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️ Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    return;
  }

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user based on Google profile
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            // Link Google ID to existing user
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value || null,
            });
          }
        } else {
          // Update avatar if changed
          if (profile.photos[0]?.value && user.avatar !== profile.photos[0].value) {
            user.avatar = profile.photos[0].value;
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  ));
  
  googleStrategyInitialized = true;
  console.log('✅ Google OAuth strategy initialized');
};

// Initialize passport
router.use(passport.initialize());

// Initialize Google Strategy when first route is accessed
router.use((req, res, next) => {
  initializeGoogleStrategy();
  next();
});

// Google OAuth login route - redirects to Google
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`,
  }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  })(req, res, next);
});

// Demo login (for development - simulates OAuth)
router.post('/demo-login', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email: email || 'demo@algodeck.com',
        name: name || 'Demo User',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: user.fullProfile,
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user.fullProfile,
  });
});

// Update user preferences
router.patch('/preferences', authenticateToken, async (req, res) => {
  try {
    const { theme, defaultView } = req.body;
    const updates = {};

    if (theme) updates['preferences.theme'] = theme;
    if (defaultView) updates['preferences.defaultView'] = defaultView;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.json({
      success: true,
      user: user.fullProfile,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Logout (client-side handles token removal)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
