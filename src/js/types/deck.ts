export default interface Deck {
  id: string;
  sections: {
    primary: string[];
    secondary: string[];
  };
  entries: Record<string, any[]>;
}
