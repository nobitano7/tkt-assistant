import { type ItineraryGroup, type BookingInfo, type AirportInfo, type GroupFareFlightInfo } from '../types';
import { type ChatMessage } from '../types';

// Use Vite's environment variable handling. The `import.meta.env` object is populated by Vite during the build process.
// FIX: Cast `import.meta` to `any` to bypass TypeScript error when Vite client types are not available.
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function to convert a File object to a Gemini-compatible Part (as a plain object).
async function fileToData(file: File): Promise<{ data: string; mimeType: string }> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    data: await base64EncodedDataPromise,
    mimeType: file.type,
  };
}

// Main chat function with streaming
export async function sendMessage(
  history: ChatMessage[],
  message: string,
  image?: { data: string; mimeType: string }
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message, image }),
  });

  if (!response.ok || !response.body) {
    const error = await response.json().catch(() => ({ error: 'Network response was not ok and no JSON body.' }));
    throw new Error(error.error || 'Network response was not ok.');
  }

  return response.body;
}


// Tool-specific functions
export async function parsePnrToQuote(pnrText: string): Promise<{ itineraryGroups: ItineraryGroup[] }> {
  const response = await fetch(`${API_BASE_URL}/parse-pnr-to-quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnrText }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse PNR to quote.');
  }
  return response.json();
}

export async function parseBookingToMessages(content: string, attachedFile: File | null): Promise<BookingInfo> {
  const filePart = attachedFile ? await fileToData(attachedFile) : null;
  
  const response = await fetch(`${API_BASE_URL}/parse-booking-to-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, filePart }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to parse booking to messages.');
  }
  return response.json();
}

export async function parseGroupFareRequest(content: string, attachedFile: File | null): Promise<GroupFareFlightInfo[]> {
  const filePart = attachedFile ? await fileToData(attachedFile) : null;
  const response = await fetch(`${API_BASE_URL}/parse-group-fare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, filePart }),
  });
  if (!response.ok) {
     const error = await response.json();
    throw new Error(error.error || 'Failed to parse group fare request.');
  }
  return response.json();
}

export async function findNearestAirports(location: string): Promise<AirportInfo[]> {
   const response = await fetch(`${API_BASE_URL}/find-nearest-airports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location }),
  });
  if (!response.ok) {
     const error = await response.json();
    throw new Error(error.error || 'Failed to find nearest airports.');
  }
  return response.json();
}


export async function runTimaticTool(nationality: string, destination: string, transitPoints: string[], bookingText: string): Promise<{ timaticResult: string, extractedDetails?: any }> {
   const response = await fetch(`${API_BASE_URL}/timatic-lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nationality, destination, transitPoints, bookingText }),
  });
  if (!response.ok) {
     const error = await response.json();
    throw new Error(error.error || 'Failed to perform TIMATIC lookup.');
  }
  return response.json();
}

export async function runGdsEncoderTool(tool: string, params: any): Promise<{ result: string }> {
   const response = await fetch(`${API_BASE_URL}/gds-encoder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, params }),
  });
  if (!response.ok) {
     const error = await response.json();
    throw new Error(error.error || `Failed to run GDS tool: ${tool}`);
  }
  return response.json();
}
