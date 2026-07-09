// Common English typing mistakes → correct word
const CORRECTIONS: Record<string, string> = {
  // transpositions & quick-typing errors
  teh: 'the', hte: 'the', thge: 'the',
  adn: 'and', nad: 'and', andd: 'and',
  fo: 'of', og: 'of',
  wiht: 'with', wtih: 'with',
  taht: 'that', tath: 'that',
  thier: 'their', theri: 'their',
  htey: 'they', tehy: 'they',
  yuo: 'you', oyu: 'you',
  youre: "you're",
  wont: "won't",
  cant: "can't",
  dont: "don't",
  ot: 'to', tp: 'to',
  fro: 'for', fr: 'for',
  si: 'is',
  // double-letter mistakes
  accomodation: 'accommodation',
  acommodation: 'accommodation',
  adress: 'address', addres: 'address',
  agrement: 'agreement', agrrement: 'agreement',
  beggining: 'beginning', begining: 'beginning',
  belive: 'believe', beleive: 'believe',
  buisness: 'business', busines: 'business',
  calender: 'calendar',
  comming: 'coming', comeing: 'coming',
  committe: 'committee',
  completly: 'completely', completley: 'completely',
  definately: 'definitely', definetly: 'definitely',
  dependant: 'dependent',
  embarass: 'embarrass', embarrase: 'embarrass',
  enviroment: 'environment', enviorment: 'environment',
  existance: 'existence',
  expierence: 'experience', experiance: 'experience',
  finnally: 'finally', finaly: 'finally',
  freind: 'friend', frend: 'friend',
  goverment: 'government', govenment: 'government',
  grammer: 'grammar', gramer: 'grammar',
  hapening: 'happening', happning: 'happening',
  harrass: 'harass',
  immediatly: 'immediately', imediately: 'immediately',
  independant: 'independent',
  intresting: 'interesting', intersting: 'interesting',
  knolwedge: 'knowledge', knowlege: 'knowledge',
  liscense: 'license', lisence: 'license',
  maintainance: 'maintenance', maintanence: 'maintenance',
  millenium: 'millennium',
  mispell: 'misspell', mispelled: 'misspelled',
  misspeling: 'misspelling',
  necesary: 'necessary', neccessary: 'necessary', nessecary: 'necessary',
  neighbour: 'neighbor',  // keep if you want British spelling, remove otherwise
  noticable: 'noticeable',
  occured: 'occurred', occurrd: 'occurred',
  occurence: 'occurrence', occurrance: 'occurrence',
  parralel: 'parallel', paralel: 'parallel',
  persue: 'pursue',
  posession: 'possession', possesion: 'possession',
  prefered: 'preferred', preffered: 'preferred',
  priviledge: 'privilege', privilage: 'privilege',
  probaly: 'probably', probabaly: 'probably',
  pronounciation: 'pronunciation',
  publically: 'publicly',
  questionaire: 'questionnaire',
  recieve: 'receive', recive: 'receive',
  recomend: 'recommend', recommed: 'recommend',
  referance: 'reference', refrence: 'reference',
  relevent: 'relevant', relevnt: 'relevant',
  restaraunt: 'restaurant', resturant: 'restaurant',
  rythm: 'rhythm',
  seperate: 'separate', seprate: 'separate',
  similiar: 'similar', similer: 'similar',
  speach: 'speech',
  successfull: 'successful', succesful: 'successful',
  suprise: 'surprise', surprize: 'surprise',
  tendancy: 'tendency',
  tommorow: 'tomorrow', tomorow: 'tomorrow',
  truely: 'truly',
  untill: 'until', unitl: 'until',
  usualy: 'usually', usally: 'usually',
  vaccum: 'vacuum',
  visious: 'vicious',
  wierd: 'weird', wired: 'weird',
  writting: 'writing',
  // interior design / business terms
  kicthen: 'kitchen', kicthn: 'kitchen',
  cabient: 'cabinet', cabnet: 'cabinet',
  wardorbe: 'wardrobe', wardrob: 'wardrobe',
  cuboard: 'cupboard', cubpoard: 'cupboard',
  modualr: 'modular', moduarl: 'modular',
  matreial: 'material', materail: 'material',
  instalation: 'installation', installlation: 'installation',
  measurment: 'measurement', mesurement: 'measurement',
  delivary: 'delivery', delvery: 'delivery',
  payement: 'payment', paymnet: 'payment',
  invocie: 'invoice', invoce: 'invoice',
  amoutn: 'amount', amonut: 'amount',
  totla: 'total', toatl: 'total',
  clinet: 'client', cleint: 'client',
  // "description" — very common in item rows
  desritption: 'description', descritpion: 'description',
  discription: 'description', desciption: 'description',
  descripion: 'description', descriptin: 'description',
  descriptoin: 'description', descrption: 'description',
  dsecription: 'description', descripiton: 'description',
}

export interface Correction {
  original: string
  corrected: string
  index: number
}

/**
 * Returns corrected text and a list of changes made.
 * Only fixes whole words (case-insensitive match, case-preserving output).
 */
export function autocorrect(text: string): { result: string; corrections: Correction[] } {
  const corrections: Correction[] = []

  const result = text.replace(/\b([a-zA-Z]+)\b/g, (word, _match, offset) => {
    const lower = word.toLowerCase()
    const fix = CORRECTIONS[lower]
    if (!fix) return word

    // Preserve original capitalisation pattern
    let fixed = fix
    if (word[0] === word[0].toUpperCase()) {
      fixed = fix.charAt(0).toUpperCase() + fix.slice(1)
    }
    if (word === word.toUpperCase()) {
      fixed = fix.toUpperCase()
    }

    corrections.push({ original: word, corrected: fixed, index: offset })
    return fixed
  })

  return { result, corrections }
}
