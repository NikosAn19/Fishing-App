export interface FishFact {
  id: string;
  fact: string;
  category: 'Biology' | 'Ecology' | 'History' | 'Conservation';
  icon?: string;
  image?: any; // For require() images
}

export const FISH_FACTS: FishFact[] = [
  {
    id: 'seabass',
    fact: 'Το Λαβράκι (Dicentrarchus labrax) είναι γνωστό ότι κυνηγά σε αγέλες, εγκλωβίζοντας τα μικρόψαρα στα ρηχά για ευκολότερη λεία.',
    category: 'Biology',
    icon: 'fish',
    image: require('../assets/seabass_splash.jpg')
  },
  {
    id: 'barracuda',
    fact: 'Ο Λούτσος (Sphyraena) είναι δεινός θηρευτής που μπορεί να επιταχύνει έως και 43 χλμ/ώρα για να αιφνιδιάσει τη λεία του.',
    category: 'Ecology',
    icon: 'flash',
    image: require('../assets/barracuda_splash.jpg')
  },
  {
    id: 'seabream',
    fact: 'Η Τσιπούρα (Sparus aurata) διαθέτει εξαιρετικά δυνατά σαγόνια που της επιτρέπουν να σπάει τα κελύφη οστρακοειδών και καβουριών.',
    category: 'Biology',
    icon: 'shield',
    image: require('../assets/seabream_splash.webp')
  }
];

export const getRandomFact = (): FishFact => {
  const randomIndex = Math.floor(Math.random() * FISH_FACTS.length);
  return FISH_FACTS[randomIndex];
};
