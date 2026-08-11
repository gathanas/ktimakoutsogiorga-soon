import type { Wine } from '../types.js'

export const wines: Wine[] = [
  {
    name: 'Mandolino',
    nameEl: 'Μαντολίνο',
    grape: 'Cabernet Sauvignon & Merlot',
    descriptionEl:
      'Ένα δυναμικό ερυθρό κρασί με σκούρα φρούτα, μπαχαρικά και βελούδινη επίγευση. Ωρίμανση σε γαλλική δρυ.',
    ingredientsEl: 'Cabernet Sauvignon (60%), Merlot (40%), περιέχει θειώδη',
    alcohol: '13.5%',
    nutrition: {
      energy: { kj: 314, kcal: 75 },
      fat: 0.0,
      saturatedFat: 0.0,
      carbohydrates: 0.9,
      sugars: 0.2,
      protein: 0.0,
      salt: 0.1,
    },
  },
  {
    name: "Livia's Rosé",
    nameEl: "Livia's Rosé",
    grape: 'Cabernet Sauvignon & Merlot',
    descriptionEl:
      'Ένα απαλό ροζέ με φρέσκα κόκκινα μούρα, λουλουδάτες νότες και δροσερή επίγευση.',
    ingredientsEl: 'Cabernet Sauvignon (55%), Merlot (45%), περιέχει θειώδη',
    alcohol: '12.5%',
    nutrition: {
      energy: { kj: 293, kcal: 70 },
      fat: 0.0,
      saturatedFat: 0.0,
      carbohydrates: 1.2,
      sugars: 0.5,
      protein: 0.0,
      salt: 0.1,
    },
  },
  {
    slug: 'oenous',
    name: 'Oinous',
    nameEl: 'Οινούς',
    grape: 'Ασύρτικο',
    descriptionEl:
      'Ένα ζωηρό Ασύρτικο με εσπεριδοειδή, μεταλλικότητα και μακριά, κομψή επίγευση.',
    ingredientsEl: 'Ασύρτικο (100%), περιέχει θειώδη',
    alcohol: '13%',
    nutrition: {
      energy: { kj: 305, kcal: 73 },
      fat: 0.0,
      saturatedFat: 0.0,
      carbohydrates: 0.8,
      sugars: 0.3,
      protein: 0.0,
      salt: 0.1,
    },
  },
  {
    name: 'Kores',
    nameEl: 'Κόρες',
    grape: 'Ασύρτικο & Κυδωνίτσα',
    descriptionEl:
      'Ένα εκλεπτυσμένο λευκό blend που συνδυάζει τη δομή του Ασύρτικου με την αρωματική πολυπλοκότητα της Κυδωνίτσας.',
    ingredientsEl: 'Ασύρτικο (60%), Κυδωνίτσα (40%), περιέχει θειώδη',
    alcohol: '12.5%',
    nutrition: {
      energy: { kj: 293, kcal: 70 },
      fat: 0.0,
      saturatedFat: 0.0,
      carbohydrates: 1.0,
      sugars: 0.4,
      protein: 0.0,
      salt: 0.1,
    },
  },
  {
    name: 'Kato Rachi',
    nameEl: 'Κάτω Ράχη',
    grape: 'Κυδωνίτσα',
    descriptionEl:
      'Μια γνήσια Κυδωνίτσα με κυδώνι, πυρηνόκαρπα και ξεχωριστό αρωματικό χαρακτήρα μοναδικό στην περιοχή.',
    ingredientsEl: 'Κυδωνίτσα (100%), περιέχει θειώδη',
    alcohol: '12%',
    nutrition: {
      energy: { kj: 280, kcal: 67 },
      fat: 0.0,
      saturatedFat: 0.0,
      carbohydrates: 1.1,
      sugars: 0.5,
      protein: 0.0,
      salt: 0.1,
    },
  },
]
