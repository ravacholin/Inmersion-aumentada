export interface Phrase {
  spanish: string;
  translation: string;
}

export interface AnalysisResult {
  objectName: string;
  phrases: Phrase[];
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}
