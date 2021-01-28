type NickNameMetaData = {
  realName: string[];
  setCode: string;
  collectorNumber: string;
  nickname: string[];
  source: string;
};

const nicknames: NickNameMetaData[] = [
  // Guilds of Ravnica (GRN)
  {
    // https://scryfall.com/card/grn/158
    realName: ["Centaur Peacemaker"],
    nickname: ["Your Centaur Valentine"],
    setCode: "grn",
    collectorNumber: "158",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/202
    realName: ["Swathcutter Giant"],
    nickname: ["One Beefy Boi"],
    setCode: "grn",
    collectorNumber: "202",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/161
    realName: ["Conclave Cavalier"],
    nickname: ["Elfcoil Engine"],
    setCode: "grn",
    collectorNumber: "161",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/181
    realName: ["Join Shields"],
    nickname: ["This DM Screen is Too Big"],
    setCode: "grn",
    collectorNumber: "181",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/172
    realName: ["Garrison Sergeant"],
    nickname: ["Air-Traffic Control Lizard"],
    setCode: "grn",
    collectorNumber: "172",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/153
    realName: ["Aurelia, Exemplar of Justice"],
    nickname: ["Aurelia With The Good Hair"],
    setCode: "grn",
    collectorNumber: "153",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/37
    realName: ["Disdainful Stroke"],
    nickname: ["Long-Ass CVS Receipt"],
    setCode: "grn",
    collectorNumber: "37",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/209
    realName: ["Truefire Captain"],
    nickname: ["Don't Mess With The Reckoner"],
    setCode: "grn",
    collectorNumber: "209",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/120
    realName: ["Wojek Bodyguard"],
    nickname: ["AAA Video Game Man"],
    setCode: "grn",
    collectorNumber: "120",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/82
    realName: ["Plaguecrafter"],
    nickname: ["Fleshbae Marauder"],
    setCode: "grn",
    collectorNumber: "82",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/grn/125
    realName: ["Circuitous Route"],
    nickname: ["This Garden is 90% Snakes!"],
    setCode: "grn",
    collectorNumber: "125",
    source: "Scryfall Preview Name",
  },

  // Ravnica Allegiance (RNA)
  {
    // https://scryfall.com/card/rna/130
    realName: ["Guardian Project "],
    nickname: ["Mutant, NM, Pack Fresh"],
    setCode: "rna",
    collectorNumber: "130",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/201
    realName: ["Rhythm of the Wild"],
    nickname: ["He called me Mister Pig!"],
    setCode: "rna",
    collectorNumber: "201",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/70
    realName: ["Cry of the Carnarium"],
    nickname: ["Panic! At the Disco"],
    setCode: "rna",
    collectorNumber: "70",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/182
    realName: ["High Alert"],
    nickname: ["Doran the Explorer"],
    setCode: "rna",
    collectorNumber: "182",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/60
    realName: ["Windstorm Drake"],
    nickname: ["Actually, it's a Wyvern"],
    setCode: "rna",
    collectorNumber: "60",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/221
    realName: ["Bedeck", "Bedazzle"],
    nickname: ["Party in the Streets", "Demon in the Sheets"],
    setCode: "rna",
    collectorNumber: "221",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/47
    realName: ["Pteramander"],
    nickname: ["Science Has Gone Too Far"],
    setCode: "rna",
    collectorNumber: "47",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/29
    realName: ["Unbreakable Formation"],
    nickname: ["Strong and Stabby"],
    setCode: "rna",
    collectorNumber: "29",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/180
    realName: ["Gyre Engineer"],
    nickname: ["Space Jockey"],
    setCode: "rna",
    collectorNumber: "180",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/37
    realName: ["Essence Capture"],
    nickname: ["Now I'M the Minotaur!"],
    setCode: "rna",
    collectorNumber: "37",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/141
    realName: ["Silhana Wayfinder"],
    nickname: ["Tom Martell's Scarf"],
    setCode: "rna",
    collectorNumber: "141",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/193
    realName: ["Nikya of the Old Ways"],
    nickname: ["Mana Mare"],
    setCode: "rna",
    collectorNumber: "193",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/79
    realName: ["Orzhov Enforcer"],
    nickname: ["Knife To Meet You"],
    setCode: "rna",
    collectorNumber: "79",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/113
    realName: ["Scorchmark"],
    nickname: ["#branding"],
    setCode: "rna",
    collectorNumber: "113",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/233
    realName: ["Glass of the Guildpact"],
    nickname: ["Azhovirzzekdosaruulosnyic Signet"],
    setCode: "rna",
    collectorNumber: "233",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/254
    realName: ["Plaza of Harmony"],
    nickname: ["Ayn Rand Could Never"],
    setCode: "rna",
    collectorNumber: "254",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/123
    realName: ["Spirit of the Spires"],
    nickname: ["Dead and Fabulous, Darling"],
    setCode: "rna",
    collectorNumber: "123",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/158
    realName: ["Biomancer's Familiar"],
    nickname: ["Mutant Gremlin Spider"],
    setCode: "rna",
    collectorNumber: "158",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/rna/172
    realName: ["Fireblade Artist"],
    nickname: ["Beric Dondarrion"],
    setCode: "rna",
    collectorNumber: "172",
    source: "Scryfall Preview Name",
  },

  // War of the Spark (WAR)
  {
    // https://scryfall.com/card/war/185
    realName: ["Angrath's Rampage"],
    nickname: ["Mad Cow Disease"],
    setCode: "war",
    collectorNumber: "185",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/227
    realName: ["Angrath, Captain of Chaos"],
    nickname: ["No Fire, No Steely Eyes"],
    setCode: "war",
    collectorNumber: "227",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/113
    realName: ["Ahn-Crop Invader"],
    nickname: ["Wheat Farmer of Bolas"],
    setCode: "war",
    collectorNumber: "113",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/125
    realName: ["Dreadhorde Arcanist"],
    nickname: ["I'm flying, Jack!"],
    setCode: "war",
    collectorNumber: "125",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/95
    realName: ["Lazotep Behemoth"],
    nickname: ["Celestial Colonnade Wuz Here"],
    setCode: "war",
    collectorNumber: "95",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/59
    realName: ["Lazotep Plating"],
    nickname: ["No Eyes, Exploding Heart, Can't Lose"],
    setCode: "war",
    collectorNumber: "59",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/96
    realName: ["Lazotep Reaver"],
    nickname: ["LEGO Bites Back"],
    setCode: "war",
    collectorNumber: "96",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/134
    realName: ["Invading Manticore"],
    nickname: ["Limited Edition Re-Tail Eternal"],
    setCode: "war",
    collectorNumber: "134",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/124
    realName: ["Devouring Hellion"],
    nickname: ["Dyson Has Gone Too Far"],
    setCode: "war",
    collectorNumber: "124",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/137
    realName: ["Krenko, Tin Street Kingpin"],
    nickname: ["Krenko is Forever"],
    setCode: "war",
    collectorNumber: "137",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/159
    realName: ["Evolution Sage"],
    nickname: ["I need a tree here, stat"],
    setCode: "war",
    collectorNumber: "159",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/157
    realName: ["Challenger Troll"],
    nickname: ["Who left this skeleton here?"],
    setCode: "war",
    collectorNumber: "157",
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/war/27
    realName: ["Rally of Wings"],
    nickname: ["I Thought I'd Just Be Guarding Garrisons, You Know?"],
    setCode: "war",
    collectorNumber: "27",
    source: "Scryfall Preview Name",
  },

  // Modern Horizons (MH1)
  {
    // https://scryfall.com/card/mh1/208
    setCode: "mh1",
    collectorNumber: "208",
    realName: ["Lightning Skelemental"],
    nickname: ["Ball Blightning"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/118
    setCode: "mh1",
    collectorNumber: "118",
    realName: ["Aria of Flame"],
    nickname: ["A Song of Just Fire"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/179/its-clobberin-time!
    setCode: "mh1",
    collectorNumber: "179",
    realName: ["Scale Up"],
    nickname: ["It's Clobberin' Time!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/39/nooohh-charlie!
    setCode: "mh1",
    collectorNumber: "39",
    realName: ["Zhalfirin Decoy"],
    nickname: ["NooOHH, Charlie!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/224/yeti-but-make-it-badass
    setCode: "mh1",
    collectorNumber: "224",
    realName: ["Icehide Golem"],
    nickname: ["Yeti, But Make it Badass"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/58/i-have-had-it-with-these-samuel-l-jackson-quotes
    setCode: "mh1",
    collectorNumber: "58",
    realName: ["Mist-Syndicate Naga"],
    nickname: ["I Have HAD IT With These Samuel L. Jackson Quotes"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/mh1/83/markov-manners
    setCode: "mh1",
    collectorNumber: "83",
    realName: ["Cordial Vampire"],
    nickname: ["Markov Manners"],
    source: "Scryfall Preview Name",
  },

  // Coreset M20
  {
    // https://scryfall.com/card/m20/202/we-are-groot
    setCode: "m20",
    collectorNumber: "202",
    realName: ["Wakeroot Elemental"],
    nickname: ["We Are Groot"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/200/fight-night-dra
    setCode: "m20",
    collectorNumber: "200",
    realName: ["Voracious Hydra"],
    nickname: ["Fight Night-dra"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/134/he-can-dig-it!
    setCode: "m20",
    collectorNumber: "134",
    realName: ["Destructive Digger"],
    nickname: ["He Can Dig It!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/142/goblin-hitchhiker
    setCode: "m20",
    collectorNumber: "142",
    realName: ["Goblin Bird-Grabber"],
    nickname: ["Goblin Hitchhiker"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/236/good-wand-lightly-used-no-refunds
    setCode: "m20",
    collectorNumber: "236",
    realName: ["Retributive Wand"],
    nickname: ["Good Wand, Lightly Used, No Refunds"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/8/roma-downey
    setCode: "m20",
    collectorNumber: "8",
    realName: ["Bishop of Wings"],
    nickname: ["Roma Downey"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/105/we-ran-out-of-punch
    setCode: "m20",
    collectorNumber: "105",
    realName: ["Knight of the Ebon Legion"],
    nickname: ["We Ran Out of Punch"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/10/brillantemental
    setCode: "m20",
    collectorNumber: "10",
    realName: ["Cavalier of Dawn"],
    nickname: ["Brilliantemental"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/224/metal-mario
    setCode: "m20",
    collectorNumber: "224",
    realName: ["Diamond Knight"],
    nickname: ["Metal Mario"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/63/the-paper
    setCode: "m20",
    collectorNumber: "63",
    realName: ["Hard Cover"],
    nickname: ["The Paper"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/229/picture-of-dorian-slay
    setCode: "m20",
    collectorNumber: "229",
    realName: ["Icon of Ancestry"],
    nickname: ["Picture of Dorian Slay"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/225/ark-of-the-coffer-nant
    setCode: "m20",
    collectorNumber: "225",
    realName: ["Diviner's Lockbox"],
    nickname: ["Ark of the Coffer-nant"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/84/kill-stealer
    setCode: "m20",
    collectorNumber: "84",
    realName: ["Audacious Thief"],
    nickname: ["Kill Stealer"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/172/legendary-hydration
    setCode: "m20",
    collectorNumber: "172",
    realName: ["Gargos, Vicious Watcher"],
    nickname: ["Legendary Hydration"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m20/218/sir-are-you-aware-there-are-men-on-the-side-of-your-hippogriff%253F
    setCode: "m20",
    collectorNumber: "218",
    realName: ["Skyknight Vanguard"],
    nickname: [
      "Sir, are you aware there are men on the side of your hippogriff?",
    ],
    source: "Scryfall Preview Name",
  },

  // Commander 2019
  {
    // https://scryfall.com/card/c19/11/honey-i-traded-the-kids
    setCode: "c19",
    collectorNumber: "11",
    realName: ["Sudden Substitution"],
    nickname: ["Honey I Traded the Kids"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c19/34/lets-take-the-shortcut
    setCode: "c19",
    collectorNumber: "34",
    realName: ["Road of Return"],
    nickname: ["Let's Take the Shortcut"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c19/4/chains-of-30-50-feral-minotaurs
    setCode: "c19",
    collectorNumber: "4",
    realName: ["Mandate of Peace"],
    nickname: ["Chains of 30-50 Feral Minotaurs"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c19/14/online-salty-boy
    setCode: "c19",
    collectorNumber: "14",
    realName: ["Archfiend of Spite"],
    nickname: ["Online Salty Boi"],
    source: "Scryfall Preview Name",
  },

  // Throne of Eldraine (ELD)
  {
    // https://scryfall.com/card/eld/309/okos-jojo-reference
    setCode: "eld",
    collectorNumber: "309",
    realName: ["Oko, the Trickster"],
    nickname: ["Oko's JoJo Reference"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/310/flying-with-scissors
    setCode: "eld",
    collectorNumber: "310",
    realName: ["Oko's Accomplices"],
    nickname: ["Flying With Scissors"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/305/griffin-wants-zoomies
    setCode: "eld",
    collectorNumber: "305",
    realName: ["Garrison Griffin"],
    nickname: ["Griffin Wants Zoomies"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/304/rowans-not-messing-around-anymore
    setCode: "eld",
    collectorNumber: "304",
    realName: ["Rowan, Fearless Sparkmage"],
    nickname: ["Rowan's Not Messing Around Anymore"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/306/rowans-badass-sidekick
    setCode: "eld",
    collectorNumber: "306",
    realName: ["Rowan's Battleguard"],
    nickname: ["Rowan's Badass Sidekick"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/307/rowans-red-riding-hoods
    setCode: "eld",
    collectorNumber: "307",
    realName: ["Rowan's Stalwarts"],
    nickname: ["Rowan's Red Riding Hoods"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/212/mozilla-firefox-rider-double-download
    setCode: "eld",
    collectorNumber: "212",
    realName: ["Oakhame Ranger", "Bring Back"],
    nickname: ["Mozilla, Firefox Rider", "Double Download"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/157/ho-ho-ho-green-giant-(knight)
    setCode: "eld",
    collectorNumber: "157",
    realName: ["Garenbrig Paladin"],
    nickname: ["Ho Ho Ho, Green Giant (....Knight)"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/170/dont-be-so-over-bearing
    setCode: "eld",
    collectorNumber: "170",
    realName: ["Outmuscle"],
    nickname: ["Don't Be So Over-bear-ing"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/168/next-time-on-belle-and-sebastian
    setCode: "eld",
    collectorNumber: "168",
    realName: ["Once and Future"],
    nickname: ["Next Time On ‘Belle and Sebastian'"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/207/the-specter-and-the-thief-of-the-night
    setCode: "eld",
    collectorNumber: "207",
    realName: ["Covetous Urge"],
    nickname: ["The Specter and the Thief of the Night"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/150/kids-these-days-eat-too-much-candy-nom-nom-nom
    setCode: "eld",
    collectorNumber: "150",
    realName: ["Curious Pair", "Treats to Share"],
    nickname: ["Kids These Days Eat Too Much Candy", "Nom Nom Nom"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/66/ugh-not-this-dream-again
    setCode: "eld",
    collectorNumber: "66",
    realName: ["Stolen by the Fae"],
    nickname: ["Ugh, Not This Dream Again"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/167/am-i-standing-on-a-giant-caterpillar%253F
    setCode: "eld",
    collectorNumber: "167",
    realName: ["Oakhame Adversary"],
    nickname: ["Am I standing on a giant caterpillar?"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/135/apply-torch-to-face-for-best-results
    setCode: "eld",
    collectorNumber: "135",
    realName: ["Redcap Melee"],
    nickname: ["Apply torch to face for best results"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/106/hey-macarena!
    setCode: "eld",
    collectorNumber: "106",
    realName: ["Specter's Shriek"],
    nickname: ["Hey Macarena!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/235/onix-trainer-wants-to-battle
    setCode: "eld",
    collectorNumber: "235",
    realName: ["Stonecoil Serpent"],
    nickname: ["Onix Trainer Wants to Battle"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/246/bed-%26-breakfast
    setCode: "eld",
    collectorNumber: "246",
    realName: ["Idyllic Grange"],
    nickname: ["Bed and Breakfast"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/125/dwarf-wind-%26-fire
    setCode: "eld",
    collectorNumber: "125",
    realName: ["Fires of Invention"],
    nickname: ["Dwarf, Wind and Fire"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/eld/213/kool-aid%25C2%25AE-man
    setCode: "eld",
    collectorNumber: "213",
    realName: ["Rampart Smasher"],
    nickname: ["Kool-Aid® Man"],
    source: "Scryfall Preview Name",
  },

  // Theros Beyond Death (THB)
  {
    // https://scryfall.com/card/thb/185/ten-lords-a-leaping
    setCode: "thb",
    collectorNumber: "185",
    realName: ["Nylea, Keen-Eyed"],
    nickname: ["Ten Lords-a-Leaping"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/230/captain-kronch
    setCode: "thb",
    collectorNumber: "230",
    realName: ["Warden of the Chained"],
    nickname: ["Captain Kronch"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/157/thunderbolt-and-lightning-very-very-frightening-me!
    setCode: "thb",
    collectorNumber: "157",
    realName: ["Storm's Wrath"],
    nickname: ["Thunderbolt and lightning, very, very frightening me!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/59/dancing-with-the-stars
    setCode: "thb",
    collectorNumber: "59",
    realName: ["One with the Stars"],
    nickname: ["Dancing With The Stars"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/5/legend-of-the-leftover-nog
    setCode: "thb",
    collectorNumber: "5",
    realName: ["The Birth of Meletis"],
    nickname: ["Legend of the Leftover 'Nog”"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/199/mary-gary
    setCode: "thb",
    collectorNumber: "199",
    realName: ["Setessan Petitioner"],
    nickname: ["Mary Gary"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/70/nom-nom-delicious-cards
    setCode: "thb",
    collectorNumber: "70",
    realName: ["Sweet Oblivion"],
    nickname: ["Nom Nom, Delicious Cards"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/225/pensive-pious-propensity
    setCode: "thb",
    collectorNumber: "225",
    realName: ["Rise to Glory"],
    nickname: ["Pensive Pious Propensity"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/148/screaming-firehawk
    setCode: "thb",
    collectorNumber: "148",
    realName: ["Phoenix of Ash"],
    nickname: ["Screaming Firehawk"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/128/number-one-bolas-fan
    setCode: "thb",
    collectorNumber: "128",
    realName: ["Blood Aspirant"],
    nickname: ["Number One Bolas Fan"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/165/lolth
    setCode: "thb",
    collectorNumber: "165",
    realName: ["Arasta of the Endless Web"],
    nickname: ["Lolth"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/114/scrabbling-harpy
    setCode: "thb",
    collectorNumber: "114",
    realName: ["Scavenging Harpy"],
    nickname: ["Scrabbling Harpy"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/260/pull-my-finger
    setCode: "thb",
    collectorNumber: "260",
    realName: ["Callaphe, Beloved of the Sea"],
    nickname: ["Pull My Finger"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/170/harder-better-faster-stronger
    setCode: "thb",
    collectorNumber: "170",
    realName: ["The First Iroan Games"],
    nickname: ["Harder, Better, Faster, Stronger"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/98/lamia%253F-i-hardly-know-ya
    setCode: "thb",
    collectorNumber: "98",
    realName: ["Gravebreaker Lamia"],
    nickname: ["Lamia? I Hardly Know Ya"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/88/vuvuzela-zombie
    setCode: "thb",
    collectorNumber: "88",
    realName: ["Discordant Piper"],
    nickname: ["Vuvuzela Zombie"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/172/hydras-halitosis
    setCode: "thb",
    collectorNumber: "172",
    realName: ["Hydra's Growth"],
    nickname: ["Hydra's Halitosis"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/169/eidolawn
    setCode: "thb",
    collectorNumber: "169",
    realName: ["Dryad of the Ilysian Grove"],
    nickname: ["Eidolawn"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/1/iowadolon
    setCode: "thb",
    collectorNumber: "1",
    realName: ["Alseid of Life's Bounty"],
    nickname: ["Iowadolon"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/168/encarta%25C2%25AE-enchantress
    setCode: "thb",
    collectorNumber: "168",
    realName: ["Destiny Spinner"],
    nickname: ["Encarta® Enchantress"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/27/centaur-student-advisor
    setCode: "thb",
    collectorNumber: "27",
    realName: ["Lagonna-Band Storyteller"],
    nickname: ["Centaur Student Advisor"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/153/big-moo-maze-boss
    setCode: "thb",
    collectorNumber: "153",
    realName: ["Skophos Maze-Warden"],
    nickname: ["Big Moo Maze Boss"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/180/briar-tuck
    setCode: "thb",
    collectorNumber: "180",
    realName: ["Mystic Repeal"],
    nickname: ["Briar Tuck"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/177/ol-skullhead-jones
    setCode: "thb",
    collectorNumber: "177",
    realName: ["Loathsome Chimera"],
    nickname: ["Ol' Skullhead Jones"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/108/low-five-demon
    setCode: "thb",
    collectorNumber: "108",
    realName: ["Nightmare Shepherd"],
    nickname: ["Low-Five Demon"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/243/mazebrainz
    setCode: "thb",
    collectorNumber: "243",
    realName: ["Labyrinth of Skophos"],
    nickname: ["Mazebrainz"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/60/ip-violation-a-mancer
    setCode: "thb",
    collectorNumber: "60",
    realName: ["Protean Thaumaturge"],
    nickname: ["IP Violation-a-mancer"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/223/garrett
    setCode: "thb",
    collectorNumber: "223",
    realName: ["Mischievous Chimera"],
    nickname: ["Garrett"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/thb/227/phenomenal-cosmic-power-itty-bitty-head
    setCode: "thb",
    collectorNumber: "227",
    realName: ["Slaughter-Priest of Mogis"],
    nickname: ["PHENOMENAL COSMIC POWER, itty-bitty head"],
    source: "Scryfall Preview Name",
  },

  // Ikoria: Lair of Behemoths (IKO)
  {
    // https://scryfall.com/card/iko/3/beaster-egg
    setCode: "iko",
    collectorNumber: "3",
    realName: ["Mysterious Egg"],
    nickname: ["Beaster Egg"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/386/that-which-pew-pews
    setCode: "iko",
    collectorNumber: "386",
    realName: ["哀歌コウモリ (暗黒破壊獣、バトラ)"],
    nickname: ["That Which PEW PEWs"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/176/harmless-houseplant
    setCode: "iko",
    collectorNumber: "176",
    realName: ["Wilt"],
    nickname: ["Harmless Houseplant"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/111/round-2:-fight!
    setCode: "iko",
    collectorNumber: "111",
    realName: ["Clash of Titans"],
    nickname: ["Round 2: Fight!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/101/learning-social-distancing
    setCode: "iko",
    collectorNumber: "101",
    realName: ["Unbreakable Bond"],
    nickname: ["Learning Social Distancing"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/38/knock-blocked
    setCode: "iko",
    collectorNumber: "38",
    realName: ["Will of the All-Hunter"],
    nickname: ["Knock Blocked"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/88/odd-the-evens
    setCode: "iko",
    collectorNumber: "88",
    realName: ["Extinction Event"],
    nickname: ["Odd the Evens"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/141/trump-shard
    setCode: "iko",
    collectorNumber: "141",
    realName: ["Yidaro, Wandering Monster"],
    nickname: ["Trump Shard"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/201/big-boy-forest-crusher
    setCode: "iko",
    collectorNumber: "201",
    realName: ["Quartzwood Crasher"],
    nickname: ["Big Boy Forest Crusher"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/298/blargbeast
    setCode: "iko",
    collectorNumber: "298",
    realName: ["Boneyard Lurker"],
    nickname: ["BLARGbeast"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/165/spring-cleaner
    setCode: "iko",
    collectorNumber: "165",
    realName: ["Migratory Greathorn"],
    nickname: ["Spring Cleaner"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/228/obosh-with-the-leggies
    setCode: "iko",
    collectorNumber: "228",
    realName: ["Obosh, the Preypiercer"],
    nickname: ["Obosh, With the Leggies"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/61/whats-kraken
    setCode: "iko",
    collectorNumber: "61",
    realName: ["Ominous Seas"],
    nickname: ["What's Kraken"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/133/recycling-monitor
    setCode: "iko",
    collectorNumber: "133",
    realName: ["Rooting Moloch"],
    nickname: ["Recycling Monitor"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/19/professional-stunt-performer
    setCode: "iko",
    collectorNumber: "19",
    realName: ["Lavabrink Venturer"],
    nickname: ["Professional Stunt Performer"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/205/lightning-felix
    setCode: "iko",
    collectorNumber: "205",
    realName: ["Savai Thundermane"],
    nickname: ["Lightning Felix"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/35/nom-nom-nom
    setCode: "iko",
    collectorNumber: "35",
    realName: ["Swallow Whole"],
    nickname: ["Nom Nom Nom"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/223/flock-of-resistance
    setCode: "iko",
    collectorNumber: "223",
    realName: ["Jubilant Skybonder"],
    nickname: ["Flock of Resistance"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/126/supercharger
    setCode: "iko",
    collectorNumber: "126",
    realName: ["Momentum Rumbler"],
    nickname: ["Supercharger"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/149/screebfriend
    setCode: "iko",
    collectorNumber: "149",
    realName: ["Essence Symbiote"],
    nickname: ["Screebfriend"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/86/punk-mentor
    setCode: "iko",
    collectorNumber: "86",
    realName: ["Duskfang Mentor"],
    nickname: ["Punk Mentor"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/121/frillneck-fashionista
    setCode: "iko",
    collectorNumber: "121",
    realName: ["Frillscare Mentor"],
    nickname: ["Frillneck Fashionista"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/10/tron-guard
    setCode: "iko",
    collectorNumber: "10",
    realName: ["Drannith Healer"],
    nickname: ["TRON Guard"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/60/great-minds
    setCode: "iko",
    collectorNumber: "60",
    realName: ["Of One Mind"],
    nickname: ["Great Minds"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/215/thinkin-bout-dragons
    setCode: "iko",
    collectorNumber: "215",
    realName: ["Whirlwind of Thought"],
    nickname: ["Thinkin' 'bout Dragons"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/208/slithery-sneak
    setCode: "iko",
    collectorNumber: "208",
    realName: ["Slitherwisp"],
    nickname: ["Slithery Sneak"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/iko/191/part-of-your-world
    setCode: "iko",
    collectorNumber: "191",
    realName: ["Inspired Ultimatum"],
    nickname: ["Part of Your World"],
    source: "Scryfall Preview Name",
  },

  // Commander 2020 (C20)
  {
    // https://scryfall.com/card/c20/52/menacing-politics
    setCode: "c20",
    collectorNumber: "52",
    realName: ["Frontier Warmonger"],
    nickname: ["Menacing Politics"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c20/56/cycla-bird
    setCode: "c20",
    collectorNumber: "56",
    realName: ["Spellpyre Phoenix"],
    nickname: ["Cycla-bird"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c20/58/capthreecorn
    setCode: "c20",
    collectorNumber: "58",
    realName: ["Capricopian"],
    nickname: ["Capthreecorn"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c20/42/no-capes!
    setCode: "c20",
    collectorNumber: "42",
    realName: ["Deadly Rollick"],
    nickname: ["No Capes!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c20/34/ethereal-forager
    setCode: "c20",
    collectorNumber: "34",
    realName: ["Ethereal Forager"],
    nickname: ["Eater of Clouds"],
    source: "Scryfall Preview Name",
  },

  {
    // https://scryfall.com/card/c20/48/jane-the-ripper
    setCode: "c20",
    collectorNumber: "48",
    realName: ["Titan Hunter"],
    nickname: ["Jane the Ripper"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/c20/64/beast-without
    setCode: "c20",
    collectorNumber: "64",
    realName: ["Sawtusk Demolisher"],
    nickname: ["Beast Without"],
    source: "Scryfall Preview Name",
  },

  // Coreset M21
  {
    // https://scryfall.com/card/m21/97/dementors-prey
    setCode: "m21",
    collectorNumber: "97",
    realName: ["Eliminate"],
    nickname: ["Dementor's Prey"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/149/playhem-devil
    setCode: "m21",
    collectorNumber: "149",
    realName: ["Havoc Jester"],
    nickname: ["Playhem Devil"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/84/whale-of-fortune
    setCode: "m21",
    collectorNumber: "84",
    realName: ["Waker of Waves"],
    nickname: ["Whale of Fortune"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/112/spoopy-scythe
    setCode: "m21",
    collectorNumber: "112",
    realName: ["Malefic Scythe"],
    nickname: ["Spoopy Scythe"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/232/book-of-big-brain-memes
    setCode: "m21",
    collectorNumber: "232",
    realName: ["Mazemind Tome"],
    nickname: ["Book of Big Brain Memes"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/34/veteran-philosopher
    setCode: "m21",
    collectorNumber: "34",
    realName: ["Seasoned Hallowblade"],
    nickname: ["Veteran Philosopher"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/72/ribbed-megalodon
    setCode: "m21",
    collectorNumber: "72",
    realName: ["Spined Megalodon"],
    nickname: ["Ribbed Megalodon"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/126/visit-from-the-in-laws
    setCode: "m21",
    collectorNumber: "126",
    realName: ["Village Rites"],
    nickname: ["Visit From the In-Laws"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/36/quite-possibly-the-goodest-boy
    setCode: "m21",
    collectorNumber: "36",
    realName: ["Selfless Savior"],
    nickname: ["Quite Possibly the Goodest Boy"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/154/one-in-a-long-line-of-immortal-iron-fists
    setCode: "m21",
    collectorNumber: "154",
    realName: ["Kinetic Augur"],
    nickname: ["One in a Long Line of Immortal Iron Fists"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/60/whale-of-the-tale
    setCode: "m21",
    collectorNumber: "60",
    realName: ["Pursued Whale"],
    nickname: ["Whale of the Tale"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/217/dire-fleet-smashy-boy
    setCode: "m21",
    collectorNumber: "217",
    realName: ["Dire Fleet Warmonger"],
    nickname: ["Dire Fleet Smashy Boy"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/190/surprise-growth-spurt
    setCode: "m21",
    collectorNumber: "190",
    realName: ["Invigorating Surge"],
    nickname: ["Surprise Growth Spurt"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/186/garruks-mega-beef-backside
    setCode: "m21",
    collectorNumber: "186",
    realName: ["Garruk's Uprising"],
    nickname: ["Garruk's Mega-Beef Backside"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/166/gather-the-healing-quartz
    setCode: "m21",
    collectorNumber: "166",
    realName: ["Traitorous Greed"],
    nickname: ["Gather the Healing Quartz"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/178/snoozy-boi-deserves-a-nap
    setCode: "m21",
    collectorNumber: "178",
    realName: ["Drowsing Tyrannodon"],
    nickname: ["Snoozy Boi Deserves a Nap"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/174/kick-your-aspen
    setCode: "m21",
    collectorNumber: "174",
    realName: ["Burlfist Oak"],
    nickname: ["Kick Your Aspen"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/56/mana-beak
    setCode: "m21",
    collectorNumber: "56",
    realName: ["Lofty Denial"],
    nickname: ["Mana Beak"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/220/the-red-green-scream
    setCode: "m21",
    collectorNumber: "220",
    realName: ["Leafkin Avenger"],
    nickname: ["The Red-Green Scream"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/184/garruks-little-friend
    setCode: "m21",
    collectorNumber: "184",
    realName: ["Garruk's Gorehorn"],
    nickname: ["Garruk's Little Friend"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/183/garruk-he-comin
    setCode: "m21",
    collectorNumber: "183",
    realName: ["Garruk, Unleashed"],
    nickname: ["Garruk, He Comin"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/185/ach!-hans-run!-its-garruk!
    setCode: "m21",
    collectorNumber: "185",
    realName: ["Garruk's Harbinger"],
    nickname: ["Ach! Hans, run! It's Garruk!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/m21/202/hangry-sabertooth
    setCode: "m21",
    collectorNumber: "202",
    realName: ["Sabertooth Mauler"],
    nickname: ["Hangry Sabertooth"],
    source: "Scryfall Preview Name",
  },

  // Zendikar Rising (ZNR)
  {
    // https://scryfall.com/card/znr/133/akoums-mean-boy
    setCode: "znr",
    collectorNumber: "133",
    realName: ["Akoum Hellhound"],
    nickname: ["Akoum's Mean Boy"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/168/cooperative-pyrotechnics
    setCode: "znr",
    collectorNumber: "168",
    realName: ["Synchronized Spellcraft"],
    nickname: ["Cooperative Pyrotechnics"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/40/best-rider-sky-temple-sky-temple
    setCode: "znr",
    collectorNumber: "40",
    realName: ["Skyclave Cleric", "Skyclave Basilica"],
    nickname: ["Best Rider", "Sky Temple"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/166/strike-the-gaming-wrist-obsidian-forest
    setCode: "znr",
    collectorNumber: "166",
    realName: ["Spikefield Hazard", "Spikefield Cave"],
    nickname: ["Strike the Gaming Wrist", "Obsidian Forest"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/132/slurp-slurp-gulp-cainhurst-swamp
    setCode: "znr",
    collectorNumber: "132",
    realName: ["Zof Consumption", "Zof Bloodbog"],
    nickname: ["Slurp Slurp Gulp", "Cainhurst Swamp"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/32/the-power-of-friendship!
    setCode: "znr",
    collectorNumber: "32",
    realName: ["Practiced Tactics"],
    nickname: ["The Power of Friendship!"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/66/seize-the-turtle-raven
    setCode: "znr",
    collectorNumber: "66",
    realName: ["Lullmage's Domination"],
    nickname: ["Seize the Turtle-Raven"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/186/green-d20
    setCode: "znr",
    collectorNumber: "186",
    realName: ["Inscription of Abundance"],
    nickname: ["Green D20"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/51/lollipop-guildmate
    setCode: "znr",
    collectorNumber: "51",
    realName: ["Cleric of Chill Depths"],
    nickname: ["Lollipop Guildmate"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/188/elvish-wizzonary
    setCode: "znr",
    collectorNumber: "188",
    realName: ["Joraga Visionary"],
    nickname: ["Elvish Wizzionary"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/175/valakut-luxury-tours
    setCode: "znr",
    collectorNumber: "175",
    realName: ["Valakut Exploration"],
    nickname: ["Valakut Luxury Tours"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/241/dracula-maybe
    setCode: "znr",
    collectorNumber: "241",
    realName: ["Zagras, Thief of Heartbeats"],
    nickname: ["Dracula, Maybe"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/240/moss-hogg
    setCode: "znr",
    collectorNumber: "240",
    realName: ["Yasharn, Implacable Earth"],
    nickname: ["Moss Hogg"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/26/the-cow-boys-of-moo-mesa
    setCode: "znr",
    collectorNumber: "26",
    realName: ["Makindi Stampede", "Makindi Mesa"],
    nickname: ["The Cow Boys Of", "Moo Mesa"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/106/get-monchd-the-monch-swamp
    setCode: "znr",
    collectorNumber: "106",
    realName: ["Hagra Mauling", "Hagra Broodpit"],
    nickname: ["Get Monch'd", "The Monch Swamp"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/219/long-boy-special
    setCode: "znr",
    collectorNumber: "219",
    realName: ["Vine Gecko"],
    nickname: ["Long-boy Special"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/183/bogle-loth
    setCode: "znr",
    collectorNumber: "183",
    realName: ["Cragplate Baloth"],
    nickname: ["Bogle-oth"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/81/need-or-greed
    setCode: "znr",
    collectorNumber: "81",
    realName: ["Skyclave Plunder"],
    nickname: ["Need or Greed"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/43/tobias-cosplayer
    setCode: "znr",
    collectorNumber: "43",
    realName: ["Tazeem Raptor"],
    nickname: ["Tobias Cosplayer"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/64/mana-squeak-mana-squeak-dungeon
    setCode: "znr",
    collectorNumber: "64",
    realName: ["Jwari Disruption", "Jwari Ruins"],
    nickname: ["Mana Squeak", "Mana Squeak Dungeon"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/189/kazandu-large-friend-kazandu-vale
    setCode: "znr",
    collectorNumber: "189",
    realName: ["Kazandu Mammoth", "Kazandu Valley"],
    nickname: ["Kazandu Large Friend", "Kazandu Vale"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/213/raspberry-jaguar
    setCode: "znr",
    collectorNumber: "213",
    realName: ["Territorial Scythecat"],
    nickname: ["Raspberry Jaguar"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/216/made-from-all-natural-sources-the-all-natural-source
    setCode: "znr",
    collectorNumber: "216",
    realName: ["Vastwood Fortification", "Vastwood Thicket"],
    nickname: ["Made From All-Natural Sources", "The All-Natural Source"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/znr/239/totally-not-a-kamigawa-dragon
    setCode: "znr",
    collectorNumber: "239",
    realName: ["Verazol, the Split Current"],
    nickname: ["Totally Not a Kamigawa Dragon"],
    source: "Scryfall Preview Name",
  },

  // Commander Legends (CMR)
  {
    // https://scryfall.com/card/cmr/69/i-disagree-and-furthermore
    setCode: "cmr",
    collectorNumber: "69",
    realName: ["Forceful Denial"],
    nickname: ["I Disagree, and Furthermore"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/175/captain-of-hms-dont-touch-my-stuff
    setCode: "cmr",
    collectorNumber: "175",
    realName: ["Emberwilde Captain"],
    nickname: ["Captain of HMS Don't-Touch-My-Stuff"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/28/aint-horsin-around
    setCode: "cmr",
    collectorNumber: "28",
    realName: ["Keleth, Sunmane Familiar"],
    nickname: ["Ain't Horsin' Around"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/66/scryhaul-sphinx
    setCode: "cmr",
    collectorNumber: "66",
    realName: ["Eligeth, Crossroads Augur"],
    nickname: ["Scryhaul Sphinx"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/214/anara-fabulous-familiar
    setCode: "cmr",
    collectorNumber: "214",
    realName: ["Anara, Wolvid Familiar"],
    nickname: ["Anara, Fabulous Familiar"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/256/flubber%25C2%25AE
    setCode: "cmr",
    collectorNumber: "256",
    realName: ["Slurrk, All-Ingesting"],
    nickname: ["Flubber®"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/219/ooze:-origins
    setCode: "cmr",
    collectorNumber: "219",
    realName: ["Biowaste Blob"],
    nickname: ["Ooze: Origins"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/135/nadier-going-through-a-phase
    setCode: "cmr",
    collectorNumber: "135",
    realName: ["Nadier, Agent of the Duskenel"],
    nickname: ["Nadier, Going Through a Phase"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/136/nadiers-stan
    setCode: "cmr",
    collectorNumber: "136",
    realName: ["Nadier's Nightblade"],
    nickname: ["Nadier's Stan"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/cmr/217/
    setCode: "cmr",
    collectorNumber: "217",
    realName: ["Apex Devastator"],
    nickname: ["But Wait, There's More!"],
    source: "Scryfall Preview Name",
  },

  // Kaldheim (KHM)
  {
    // https://scryfall.com/card/khm/171/gatorade%25E2%2584%25A2-ice-punch
    setCode: "khm",
    collectorNumber: "171",
    realName: ["Glittering Frost"],
    nickname: ["Gatorade™ Ice Punch"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/162/skyrim-bear-attack
    setCode: "khm",
    collectorNumber: "162",
    realName: ["Blizzard Brawl"],
    nickname: ["Skyrim Bear Attack"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/234/trolls%25E2%2584%25A2%25EF%25B8%258F-official-trailer
    setCode: "khm",
    collectorNumber: "234",
    realName: ["Waking the Trolls"],
    nickname: ["Trolls™ Official Trailer"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/17/the-man-who-passes-the-sentence-should-swing-the-axe
    setCode: "khm",
    collectorNumber: "17",
    realName: ["Iron Verdict"],
    nickname: ["The Man Who Passes the Sentence Should Swing the Axe"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/131/dragon-dad-uwu%25E2%2580%25A6
    setCode: "khm",
    collectorNumber: "131",
    realName: ["Dragonkin Berserker"],
    nickname: ["Dragon Dad uwu..."],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/20/unshared-triumph
    setCode: "khm",
    collectorNumber: "20",
    realName: ["Rally the Ranks"],
    nickname: ["Unshared Triumph"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/83/big-axe-diplomat
    setCode: "khm",
    collectorNumber: "83",
    realName: ["Deathknell Berserker"],
    nickname: ["Big-Axe Diplomat"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/80/fabulous-berserker
    setCode: "khm",
    collectorNumber: "80",
    realName: ["Bloodsky Berserker"],
    nickname: ["Fabulous Berserker"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/208/jack-and-jill-storm-the-hill
    setCode: "khm",
    collectorNumber: "208",
    realName: ["Fall of the Impostor"],
    nickname: ["Jack and Jill Storm the Hill"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/11/big-booty-ox
    setCode: "khm",
    collectorNumber: "11",
    realName: ["Giant Ox"],
    nickname: ["Big-Booty Ox"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/99/pyrefly-chomper
    setCode: "khm",
    collectorNumber: "99",
    realName: ["Infernal Pet"],
    nickname: ["Pyrefly Chomper"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/89/my-larger-pony
    setCode: "khm",
    collectorNumber: "89",
    realName: ["Dread Rider"],
    nickname: ["My Larger Pony"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/71/ski-resort-bandit
    setCode: "khm",
    collectorNumber: "71",
    realName: ["Pilfering Hawk"],
    nickname: ["Ski Resort Bandit"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/173/my-d%26d-oc
    setCode: "khm",
    collectorNumber: "173",
    realName: ["Grizzled Outrider"],
    nickname: ["My D&D OC"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/160/big-stabby
    setCode: "khm",
    collectorNumber: "160",
    realName: ["Battle Mammoth"],
    nickname: ["Big Stabby"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/364/in-search-of-greatness
    setCode: "khm",
    collectorNumber: "364",
    realName: ["In Search of Greatness"],
    nickname: ["Writing Werewolf Fanfics"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/62/chill-out
    setCode: "khm",
    collectorNumber: "62",
    realName: ["Icebind Pillar"],
    nickname: ["Chill Out"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/231/the-first-snowman
    setCode: "khm",
    collectorNumber: "231",
    realName: ["The Three Seasons"],
    nickname: ["The First Snowman"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/98/family-get-together
    setCode: "khm",
    collectorNumber: "98",
    realName: ["Haunting Voyage"],
    nickname: ["Family Get-Together"],
    source: "Scryfall Preview Name",
  },
  {
    // https://scryfall.com/card/khm/53/adios-wormhole
    setCode: "khm",
    collectorNumber: "53",
    realName: ["Depart the Realm"],
    nickname: ["Adios Wormhole"],
    source: "Scryfall Preview Name",
  },
];

export default nicknames;
