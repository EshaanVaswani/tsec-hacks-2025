export interface MediaFile {
   id: string;
   url: string;
   alt?: string;
   type: "image" | "video" | "audio";
   thumbnail?: string;
   timestamp?: number;
}

export interface User {
   _id: string;
   name: string;
   email: string;
   password: string;
   googleId?: string;
   phone: string;
   isVerified: boolean;
   createdAt: Date;
   friends: string[];
   groups: string[];
   dob: Date;
   updatedAt: Date;
   username: string;
}

export interface Media {
   _id: string;
   url: string;
   metadata: {
      type: string;
      timestamp?: number;
      tags?: string[];
      description?: string;
      inPictures?: User[];
      location?: {
         type: string;
         coordinates: [number, number];
      };
   };
   AIGeneratedSummary?: string;
}

export interface Capsule {
   _id?: string;
   title?: string;
   description?: string;
   unlockDate?: Date;
   creator?: User;
   media?: File[] | Media[];
   recipients?: User[]; // self id always
   accessCode?: string; //If permanent is false then only code and password should be emailed to receiptents
   isCollaborative?: boolean;
   contributors?: User[];
   isInstagramUpload?: boolean; //10 images or videos
   isPermanentLock?: boolean;
   isCollaboratorLock?: boolean; // Creator wants to lock(in)
   isRequiredUpdates?: boolean;
   createdAt?: Date;
}

export interface Group {
   _id: string;
   name: string;
   owner: User;
   members: User[];
   createdAt: Date;
   updatedAt: Date;
}

export interface NewsLocation {
   city: string | null;
   country: string;
   latitude: number | null;
   longitude: number | null;
   state: string | null;
}

export interface NewsSource {
   name: string;
   url: string;
}

export interface NewsArticle {
   description: string;
   id: number;
   legal_terms_found: string[];
   location: NewsLocation;
   publishedAt: string;
   source: NewsSource;
   title: string;
   url: string;
 }


 export interface Location {
   id: string;
   name: string;
   description: string;
   coordinates: {
     lat: number;
     lng: number;
   };
   tags: string[];
   badges: string[];
   category: string;
   status: string;
   rating: number;
 }
 
 export interface FilterState {
   search: string;
   tags: string[];
   category: string | null;
   distance: number;
   sortBy: 'distance' | 'rating' | 'name';
 }


export interface IVRState {
   currentLevel: number;
   language: "en" | "hi";
   isSpeaking: boolean;
   isListening: boolean;
   message: string;
   callDuration: number;
   currentPath: string[];
   lastResponse: string;
}

export interface GeminiResponse {
   text: string;
   nextOptions?: {
      title: string;
      options: { [key: string]: string };
   };
}
