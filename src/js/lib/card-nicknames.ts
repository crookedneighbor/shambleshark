type NickNameMetaData = {
  realName: string;
  setCode: string;
  collectorNumber: string;
  nickname: string;
  source: string;
};

const nicknames: NickNameMetaData[] = [
  // Guilds of Ravnica (GRN)
  {
    realName: "Centaur Peacemaker",
    nickname: "Your Centaur Valentine",
    setCode: "grn",
    collectorNumber: "158",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Swathcutter Giant",
    nickname: "One Beefy Boi",
    setCode: "grn",
    collectorNumber: "202",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Conclave Cavalier",
    nickname: "Elfcoil Engine",
    setCode: "grn",
    collectorNumber: "161",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Join Shields",
    nickname: "This DM Screen is Too Big",
    setCode: "grn",
    collectorNumber: "181",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Garrison Sergeant",
    nickname: "Air-Traffic Control Lizard",
    setCode: "grn",
    collectorNumber: "172",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Aurelia, Exemplar of Justice",
    nickname: "Aurelia With The Good Hair",
    setCode: "grn",
    collectorNumber: "153",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Disdainful Stroke",
    nickname: "Long-Ass CVS Receipt",
    setCode: "grn",
    collectorNumber: "37",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Truefire Captain",
    nickname: "Don’t Mess With The Reckoner",
    setCode: "grn",
    collectorNumber: "209",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Wojek Bodyguard",
    nickname: "AAA Video Game Man",
    setCode: "grn",
    collectorNumber: "120",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Plaguecrafter",
    nickname: "Fleshbae Marauder",
    setCode: "grn",
    collectorNumber: "82",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Circuitous Route",
    nickname: "This Garden is 90% Snakes!",
    setCode: "grn",
    collectorNumber: "125",
    source: "Scryfall Preview Name",
  },

  // Ravnica Allegiance (RNA)
  {
    realName: "Guardian Project ",
    nickname: "Mutant, NM, Pack Fresh",
    setCode: "rna",
    collectorNumber: "130",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Rhythm of the Wild",
    nickname: "He called me Mister Pig!",
    setCode: "rna",
    collectorNumber: "201",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Cry of the Carnarium",
    nickname: "Panic! At the Disco",
    setCode: "rna",
    collectorNumber: "70",
    source: "Scryfall Preview Name",
  },
  {
    realName: "High Alert",
    nickname: "Doran the Explorer",
    setCode: "rna",
    collectorNumber: "182",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Windstorm Drake",
    nickname: "Actually, it's a Wyvern",
    setCode: "rna",
    collectorNumber: "60",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Bedeck // Bedazzle",
    nickname: "Party in the Streets // Demon in the Sheets",
    setCode: "rna",
    collectorNumber: "221",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Pteramander",
    nickname: "Science Has Gone Too Far",
    setCode: "rna",
    collectorNumber: "47",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Unbreakable Formation",
    nickname: "Strong and Stabby",
    setCode: "rna",
    collectorNumber: "29",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Gyre Engineer",
    nickname: "Space Jockey",
    setCode: "rna",
    collectorNumber: "180",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Essence Capture",
    nickname: "Now I'M the Minotaur!",
    setCode: "rna",
    collectorNumber: "37",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Silhana Wayfinder",
    nickname: "Tom Martell's Scarf",
    setCode: "rna",
    collectorNumber: "141",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Nikya of the Old Ways",
    nickname: "Mana Mare",
    setCode: "rna",
    collectorNumber: "193",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Orzhov Enforcer",
    nickname: "Knife To Meet You",
    setCode: "rna",
    collectorNumber: "79",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Scorchmark",
    nickname: "#branding",
    setCode: "rna",
    collectorNumber: "113",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Glass of the Guildpact",
    nickname: "Azhovirzzekdosaruulosnyic Signet",
    setCode: "rna",
    collectorNumber: "233",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Plaza of Harmony",
    nickname: "Ayn Rand Could Never",
    setCode: "rna",
    collectorNumber: "254",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Spirit of the Spires",
    nickname: "Dead and Fabulous, Darling",
    setCode: "rna",
    collectorNumber: "123",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Biomancer's Familiar",
    nickname: "Mutant Gremlin Spider",
    setCode: "rna",
    collectorNumber: "158",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Fireblade Artist",
    nickname: "Beric Dondarrion",
    setCode: "rna",
    collectorNumber: "172",
    source: "Scryfall Preview Name",
  },

  // War of the Spark (WAR)
  {
    realName: "Angrath's Rampage",
    nickname: "Mad Cow Disease",
    setCode: "war",
    collectorNumber: "185",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Angrath, Captain of Chaos",
    nickname: "No Fire, No Steely Eyes",
    setCode: "war",
    collectorNumber: "227",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Ahn-Crop Invader",
    nickname: "Wheat Farmer of Bolas",
    setCode: "war",
    collectorNumber: "113",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Dreadhorde Arcanist",
    nickname: "I’m flying, Jack!",
    setCode: "war",
    collectorNumber: "125",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Lazotep Behemoth",
    nickname: "Celestial Colonnade Wuz Here",
    setCode: "war",
    collectorNumber: "95",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Lazotep Plating",
    nickname: "No Eyes, Exploding Heart, Can’t Lose",
    setCode: "war",
    collectorNumber: "59",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Lazotep Reaver",
    nickname: "LEGO Bites Back",
    setCode: "war",
    collectorNumber: "96",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Invading Manticore",
    nickname: "Limited Edition Re-Tail Eternal",
    setCode: "war",
    collectorNumber: "134",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Devouring Hellion",
    nickname: "Dyson Has Gone Too Far",
    setCode: "war",
    collectorNumber: "124",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Krenko, Tin Street Kingpin",
    nickname: "Krenko is Forever",
    setCode: "war",
    collectorNumber: "137",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Evolution Sage",
    nickname: "I need a tree here, stat",
    setCode: "war",
    collectorNumber: "159",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Challenger Troll",
    nickname: "Who left this skeleton here?",
    setCode: "war",
    collectorNumber: "157",
    source: "Scryfall Preview Name",
  },
  {
    realName: "Rally of Wings",
    nickname: "I Thought I'd Just Be Guarding Garrisons, You Know?",
    setCode: "war",
    collectorNumber: "27",
    source: "Scryfall Preview Name",
  },

  // TODO mh1
  // Modern Horizons (MH1)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "mh1",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO m20
  // Coreset M20
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "m20",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO c19
  // Commander 2019
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "c19",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO eld
  // Throne of Eldraine (ELD)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "eld",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO thb
  // Theros Beyond Death (THB)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "thb",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO iko
  // Ikoria: Lair of Behemoths (IKO)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "iko",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO c20
  // Commander 2020 (C20)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "c20",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO m21
  // Coreset M21
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "m21",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO znr
  // Zendikar Rising (ZNR)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "znr",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO cmr
  // Commander Legends (CMR)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "cmr",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },

  // TODO khm
  // Kaldheim (KHM)
  // {
  //   realName: "",
  //   nickname: "",
  //   setCode: "khm",
  //   collectorNumber: "",
  //   source: "Scryfall Preview Name",
  // },
];

export default nicknames;
