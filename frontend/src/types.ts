// Message type for chat window state
export interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string; // To hold the object URL for attached images in UI
}

// Message type for sending history to backend
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// Gemini Part type for API communication
export interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

// A single pricing row, corresponding to a fare class
export interface PriceRow {
  flightClass: string;
  passengers: string;
  baseFare: string;
  taxes: string;
  serviceFee: string;
  paxCount: string;
}

// A group of people sharing the same flight path
export interface ItineraryGroup {
  itineraryDetails: string;
  priceRows: PriceRow[];
}

// The complete quote object
export interface QuoteData {
  customerName: string;
  itineraryGroups: ItineraryGroup[];
  totalInWords: string;
  signerName: string;
  notes: string;
}

export interface BookingInfo {
  pnr: string;
  passengerName: string;
  ticketNumber: string;
  ticketingTimeLimit: string;
  bookingClass: string;
  frequentFlyer: string;
  vipInfo: string;
  itinerary: string;
}

export interface AirportInfo {
  airportName: string;
  iataCode: string;
  location: string;
  distance: string;
}

export interface GroupFareFlightInfo {
  quantity: string;
  itinerary: string;
  date: string;
  time: string;
  flightNumber: string;
  agent: string;
  agentCode: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
}

export interface Note {
  id: number;
  text: string;
  completed: boolean;
}

export interface Bookmark {
  id: number;
  name: string;
  url: string;
}

export interface GdsCommand {
  id: number;
  name: string;
  command: string;
}

export interface ChatSession {
  id: number;
  title: string;
  messages: Message[];
}
