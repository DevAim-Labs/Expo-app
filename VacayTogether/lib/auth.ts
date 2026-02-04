import { supabase } from './supabase';

// IMPORTANT: Store this key securely in your environment variables
// Never commit this to version control
const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'change-this-key-in-production';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  profile_picture_path?: string | null;
}

/**
 * Sign up a new user with encrypted data
 */
export async function signUpUser(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{ success: boolean; user?: User; session?: any; error?: string }> {
  try {
    // First, create auth user with Supabase Auth (for session management)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Check for duplicate user
      if (authError.message.includes('already') || authError.message.includes('registered')) {
        throw new Error('EMAIL_EXISTS');
      }
      throw authError;
    }
    
    if (!authData.user) throw new Error('User creation failed');

    // Insert into custom users table with encrypted data
    const { data, error } = await supabase.rpc('create_encrypted_user', {
      p_user_id: authData.user.id,
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_password: password,
      p_encryption_key: ENCRYPTION_KEY,
    });

    if (error) {
      console.error('Error creating user in custom table:', error);
      // Note: Don't delete auth user as we can't access admin functions from client
      // The auth user will exist but without custom data
      throw new Error('Failed to create user profile');
    }

    return {
      success: true,
      user: data,
      session: authData.session,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Signup failed',
    };
  }
}

/**
 * Sign in user and verify credentials
 */
export async function signInUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Login failed');

    // Update last_login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    if (updateError) console.error('Failed to update last_login:', updateError);

    // Get user profile (decrypted)
    const user = await getUserProfile(authData.user.id);

    return {
      success: true,
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
}

/**
 * Get user profile with decrypted data
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.rpc('get_decrypted_user', {
      p_user_id: userId,
      p_encryption_key: ENCRYPTION_KEY,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; email?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc('update_encrypted_user', {
      p_user_id: userId,
      p_name: updates.name,
      p_email: updates.email,
      p_phone: updates.phone,
      p_encryption_key: ENCRYPTION_KEY,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Update failed',
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) throw authError;

    // Update in custom table
    const { error } = await supabase.rpc('update_user_password', {
      p_user_id: userId,
      p_password: newPassword,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Password change failed',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(
  userId: string,
  imageUri: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Fetch the image
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    
    // Get file extension
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `profile.${ext}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true, // Replace existing profile picture
      });

    if (uploadError) throw uploadError;

    // Update user record with new profile picture path
    const { error: updateError } = await supabase.rpc('update_profile_picture', {
      p_user_id: userId,
      p_picture_path: filePath,
    });

    if (updateError) throw updateError;

    return { success: true, path: filePath };
  } catch (error: any) {
    console.error('Error uploading profile picture:', error);
    return { success: false, error: error.message || 'Failed to upload profile picture' };
  }
}

/**
 * Get profile picture URL
 */
export function getProfilePictureUrl(picturePath: string | null | undefined): string | null {
  if (!picturePath) return null;
  
  const { data } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(picturePath);
  
  return data.publicUrl;
}

/**
 * Delete profile picture
 */
export async function deleteProfilePicture(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current profile picture path
    const user = await getUserProfile(userId);
    if (!user?.profile_picture_path) {
      return { success: true }; // No picture to delete
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('profile-pictures')
      .remove([user.profile_picture_path]);

    if (deleteError) throw deleteError;

    // Update user record to remove profile picture path
    const { error: updateError } = await supabase.rpc('update_profile_picture', {
      p_user_id: userId,
      p_picture_path: null,
    });

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting profile picture:', error);
    return { success: false, error: error.message || 'Failed to delete profile picture' };
  }
}
