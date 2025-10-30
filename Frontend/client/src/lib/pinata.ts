const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export interface PinataUploadResponse {
  ipfsHash: string;
  url: string;
}

export async function uploadImageToPinata(file: File): Promise<PinataUploadResponse> {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
    throw new Error("Pinata credentials are not configured. Please set VITE_PINATA_JWT or VITE_PINATA_API_KEY/VITE_PINATA_API_SECRET in .env file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append("pinataMetadata", metadata);

  // Prepare headers - use JWT if available, otherwise use API key and secret
  const headers: Record<string, string> = {};
  
  // Prefer API Key + Secret method as it's more reliable
  if (PINATA_API_KEY && PINATA_API_SECRET) {
    headers.pinata_api_key = PINATA_API_KEY;
    headers.pinata_secret_api_key = PINATA_API_SECRET;
  } else if (PINATA_JWT) {
    headers.Authorization = `Bearer ${PINATA_JWT}`;
  }

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.details || errorData.error || JSON.stringify(errorData);
        console.error("Pinata API error details:", errorData);
      } catch (e) {
        console.error("Could not parse error response:", e);
      }
      throw new Error(`Pinata upload failed: ${errorMessage}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const url = `${PINATA_GATEWAY}/${ipfsHash}`;

    return {
      ipfsHash,
      url,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

export function getIpfsUrl(hash: string): string {
  // Handle if hash is already a full URL
  if (hash.startsWith("http://") || hash.startsWith("https://")) {
    return hash;
  }
  
  // Handle ipfs:// protocol
  if (hash.startsWith("ipfs://")) {
    hash = hash.replace("ipfs://", "");
  }
  
  // Return full Pinata gateway URL
  return `${PINATA_GATEWAY}/${hash}`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size must be less than 10MB",
    };
  }

  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "File must be an image (JPEG, PNG, GIF, or WebP)",
    };
  }

  return { valid: true };
}
