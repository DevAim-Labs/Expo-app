import { supabase } from './supabase';
import * as Crypto from 'expo-crypto';
import { decode } from 'base64-arraybuffer';

export interface Album {
  id: string;
  created_by: string;
  vacation_name: string;
  start_date: string | null;
  end_date: string | null;
  category: string;
  photo_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAlbumParams {
  vacation_name: string;
  start_date?: string;
  end_date?: string;
  category: string;
  coverImageUri?: string;
}

/**
 * Upload cover image to Supabase Storage
 */
async function uploadCoverImage(
  userId: string,
  imageUri: string,
  albumId: string
): Promise<string> {
  try {
    // Fetch the image
    const response = await fetch(imageUri);
    
    // Get array buffer directly from response
    const arrayBuffer = await response.arrayBuffer();
    
    // Get file extension
    const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${albumId}-cover.${ext}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('album-covers')
      .upload(filePath, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (error) throw error;

    return filePath;
  } catch (error) {
    console.error('Error uploading cover image:', error);
    throw error;
  }
}

/**
 * Get public URL for a cover image
 */
export function getCoverImageUrl(photoPath: string | null): string | null {
  if (!photoPath) return null;
  
  const { data } = supabase.storage
    .from('album-covers')
    .getPublicUrl(photoPath);
  
  return data.publicUrl;
}

/**
 * Create a new album
 */
export async function createAlbum(
  params: CreateAlbumParams
): Promise<{ success: boolean; album?: Album; error?: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Generate album ID first (for photo upload)
    const albumId = Crypto.randomUUID();

    // Upload cover image if provided
    let photoPath: string | null = null;
    if (params.coverImageUri) {
      try {
        photoPath = await uploadCoverImage(user.id, params.coverImageUri, albumId);
      } catch (uploadError) {
        console.error('Failed to upload cover image:', uploadError);
        // Continue without photo rather than failing completely
      }
    }

    // Parse dates (convert from "—" or empty to null)
    const startDate = params.start_date && params.start_date !== "—" ? params.start_date : null;
    const endDate = params.end_date && params.end_date !== "—" ? params.end_date : null;

    // Insert album into database
    const { data, error } = await supabase
      .from('albums')
      .insert({
        id: albumId,
        created_by: user.id,
        vacation_name: params.vacation_name,
        start_date: startDate,
        end_date: endDate,
        category: params.category,
        photo_path: photoPath,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, album: data };
  } catch (error: any) {
    console.error('Error creating album:', error);
    return { success: false, error: error.message || 'Failed to create album' };
  }
}

/**
 * Get all albums for the current user
 */
export async function getUserAlbums(): Promise<{ success: boolean; albums?: Album[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, albums: data };
  } catch (error: any) {
    console.error('Error fetching albums:', error);
    return { success: false, error: error.message || 'Failed to fetch albums' };
  }
}

/**
 * Get a single album by ID
 */
export async function getAlbum(albumId: string): Promise<{ success: boolean; album?: Album; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .single();

    if (error) throw error;

    return { success: true, album: data };
  } catch (error: any) {
    console.error('Error fetching album:', error);
    return { success: false, error: error.message || 'Failed to fetch album' };
  }
}

/**
 * Update an album
 */
export async function updateAlbum(
  albumId: string,
  updates: Partial<CreateAlbumParams>
): Promise<{ success: boolean; album?: Album; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Handle cover image upload if provided
    let photoPath: string | undefined;
    if (updates.coverImageUri) {
      try {
        photoPath = await uploadCoverImage(user.id, updates.coverImageUri, albumId);
      } catch (uploadError) {
        console.error('Failed to upload cover image:', uploadError);
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (updates.vacation_name) updateData.vacation_name = updates.vacation_name;
    if (updates.category) updateData.category = updates.category;
    if (updates.start_date !== undefined) {
      updateData.start_date = updates.start_date && updates.start_date !== "—" ? updates.start_date : null;
    }
    if (updates.end_date !== undefined) {
      updateData.end_date = updates.end_date && updates.end_date !== "—" ? updates.end_date : null;
    }
    if (photoPath) updateData.photo_path = photoPath;

    const { data, error } = await supabase
      .from('albums')
      .update(updateData)
      .eq('id', albumId)
      .eq('created_by', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, album: data };
  } catch (error: any) {
    console.error('Error updating album:', error);
    return { success: false, error: error.message || 'Failed to update album' };
  }
}

/**
 * Delete an album
 */
export async function deleteAlbum(albumId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get album to find photo path
    const { data: album } = await supabase
      .from('albums')
      .select('photo_path')
      .eq('id', albumId)
      .eq('created_by', user.id)
      .single();

    // Delete cover image from storage if exists
    if (album?.photo_path) {
      await supabase.storage
        .from('album-covers')
        .remove([album.photo_path]);
    }

    // Delete album from database
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', albumId)
      .eq('created_by', user.id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting album:', error);
    return { success: false, error: error.message || 'Failed to delete album' };
  }
}
