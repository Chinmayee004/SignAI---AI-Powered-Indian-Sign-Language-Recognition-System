async function generateSHA1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function uploadVideoToCloudinary(uploadBlob: Blob): Promise<string | null> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
    console.warn("⚠️ Cloudinary credentials missing in .env!");
    return null;
  }

  const formData = new FormData();
  if (uploadBlob instanceof File) {
    formData.append('file', uploadBlob);
  } else {
    formData.append('file', uploadBlob, `sign_recording_${Date.now()}.webm`);
  }

  if (apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // For auto upload we aren't explicitly signing a folder, just the timestamp
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = await generateSHA1(stringToSign);
    
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
  } else if (uploadPreset && uploadPreset !== 'YOUR_UPLOAD_PRESET') {
    formData.append('upload_preset', uploadPreset);
  } else {
    console.warn("⚠️ Need either VITE_CLOUDINARY_UPLOAD_PRESET or both VITE_CLOUDINARY_API_KEY & VITE_CLOUDINARY_API_SECRET in .env!");
    return null;
  }

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Cloudinary upload failed:", err);
      return null;
    }

    const data = await response.json();
    console.log("✅ Video successfully uploaded to Cloudinary:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
}