
const filePath = "/static/images/games/pokemon_hunters/other/pokemon/"
const filePathBackgrounds = "/static/images/games/pokemon_hunters/backgrounds/"
const filePathPokeballs = "/static/images/games/pokemon_hunters/buttons/pokeballs/"

const pokemonSizes = {
    tiny: "25%",
    small: "30%",
    medium: "40%",
    large: "55%",
    huge: "70%"
};

export const rarityChances = {
    common: 50,
    uncommon: 30,
    rare: 15,
    legendary: 4,
    mythical: 1
};

export const pokemon = {
    abra: {
    englishName: "Abra",
    koreanName: "캐이시",
    imageUrl: filePath + "abra.gif",
    hp: 25,
    attack: 20,
    defense: 15,
    status: rarityChances.common,
    height: pokemonSizes.small
    },

    azelf: {
    englishName: "Azelf",
    koreanName: "아그놈",
    imageUrl: filePath + "azelf.gif",
    hp: 75,
    attack: 125,
    defense: 70,
    status: rarityChances.legendary, 
    height: pokemonSizes.medium
    },

    bellsprout: {
    englishName: "Bellsprout",
    koreanName: "모다피",
    imageUrl: filePath + "bellsprout.gif",
    hp: 50,
    attack: 75,
    defense: 35,
    status: rarityChances.common,
    height: pokemonSizes.small
    },

    buizel: {
    englishName: "Buizel",
    koreanName: "브이젤",
    imageUrl: filePath + "buizel.gif",
    hp: 55,
    attack: 65,
    defense: 35,
    status: rarityChances.common,
    height: pokemonSizes.small
    },

    celebi: {
    englishName: "Celebi",
    koreanName: "세레비",
    imageUrl: filePath + "celebi.gif",
    hp: 100,
    attack: 100,
    defense: 100,
    status: rarityChances.mythical,
    height: pokemonSizes.huge
    },

    charizard_mega_x: {
    englishName: "Mega Charizard X",
    koreanName: "메가리자몽X",
    imageUrl: filePath + "charizard_megax.gif",
    hp: 78,
    attack: 130,
    defense: 111,
    status: rarityChances.rare,
    height: pokemonSizes.huge
    },

    charizard: {
    englishName: "Charizard",
    koreanName: "리자몽",
    imageUrl: filePath + "charizard.gif",
    hp: 78,
    attack: 84,
    defense: 78,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    chatot: {
    englishName: "Chatot",
    koreanName: "페라페",
    imageUrl: filePath + "Chatot.gif",
    hp: 76,
    attack: 65,
    defense: 45,
    status: rarityChances.common,
    height: pokemonSizes.medium
    },

    chingling: {
    englishName: "Chingling",
    koreanName: "랑딸랑",
    imageUrl: filePath + "chingling.gif",
    hp: 45,
    attack: 30,
    defense: 50,
    status: rarityChances.common,
    height: pokemonSizes.tiny
    },

    coalossal: {
    englishName: "Coalossal",
    koreanName: "석탄산",
    imageUrl: filePath + "coalossal.gif",
    hp: 110,
    attack: 80,
    defense: 120,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    donphan: {
    englishName: "Donphan",
    koreanName: "코리갑",
    imageUrl: filePath + "donphan.gif",
    hp: 90,
    attack: 120,
    defense: 120,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    dragapult: {
    englishName: "Dragapult",
    koreanName: "드래펄트",
    imageUrl: filePath + "dragapult.gif",
    hp: 88,
    attack: 120,
    defense: 75,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    driftblim: {
    englishName: "Drifblim",
    koreanName: "둥실라이드",
    imageUrl: filePath + "drifblim.gif",
    hp: 150,
    attack: 80,
    defense: 44,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    elektross: {
    englishName: "Eelektross",
    koreanName: "저리더프",
    imageUrl: filePath + "Eelektross.gif",
    hp: 85,
    attack: 115,
    defense: 80,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    entei: {
    englishName: "Entei",
    koreanName: "앤테이",
    imageUrl: filePath + "Entei.gif",
    hp: 115,
    attack: 115,
    defense: 85,
    status: rarityChances.legendary,
    height: pokemonSizes.huge
    },

    espon: {
    englishName: "Espeon",
    koreanName: "에브이",
    imageUrl: filePath + "Espeon.gif",
    hp: 65,
    attack: 65,
    defense: 60,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    garchomp: {
    englishName: "Garchomp",
    koreanName: "한카리아스",
    imageUrl: filePath + "garchomp.gif",
    hp: 108,
    attack: 130,
    defense: 95,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    gible: {
    englishName: "Gible",
    koreanName: "딥상어동",
    imageUrl: filePath + "gible.gif",
    hp: 58,
    attack: 70,
    defense: 45,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    girafarig: {
    englishName: "Girafarig",
    koreanName: "키링키",
    imageUrl: filePath + "girafarig.gif",
    hp: 70,
    attack: 80,
    defense: 65,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    glaceon: {
    englishName: "Glaceon",
    koreanName: "글레이시아",
    imageUrl: filePath + "glaceon.gif",
    hp: 65,
    attack: 60,
    defense: 110,
    status: rarityChances.rare,
    height: pokemonSizes.medium
    },

    groudon: {
    englishName: "Groudon",
    koreanName: "그란돈",
    imageUrl: filePath + "groudon.gif",
    hp: 100,
    attack: 150,
    defense: 140,
    status: rarityChances.legendary,
    height: "50%"
    },

    hawlucha: {
    englishName: "Hawlucha",
    koreanName: "루차불",
    imageUrl: filePath + "hawlucha.gif",
    hp: 78,
    attack: 92,
    defense: 75,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    jolten: {
    englishName: "Jolteon",
    koreanName: "쥬피썬더",
    imageUrl: filePath + "Jolteon.gif",
    hp: 65,
    attack: 65,
    defense: 60,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    kirlia: {
    englishName: "Kirlia",
    koreanName: "킬리아",
    imageUrl: filePath + "Kirlia.gif",
    hp: 38,
    attack: 35,
    defense: 35,
    status: rarityChances.uncommon, 
    height: pokemonSizes.small
    },

    leafeon: {
    englishName: "Leafeon",
    koreanName: "리피아",
    imageUrl: filePath + "leafeon.gif",
    hp: 65,
    attack: 110,
    defense: 130,
    status: rarityChances.rare,
    height: pokemonSizes.medium
    },

    luxio: {
    englishName: "Luxio",
    koreanName: "럭시오",
    imageUrl: filePath + "luxio.gif",
    hp: 60,
    attack: 85,
    defense: 49,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    mareep: {
    englishName: "Mareep",
    koreanName: "메리프",
    imageUrl: filePath + "mareep.gif",
    hp: 55,
    attack: 40,
    defense: 40,
    status: rarityChances.common,
    height: pokemonSizes.tiny
    },

    mega_absol: {
    englishName: "Mega Absol",
    koreanName: "메가앱솔",
    imageUrl: filePath + "mega_absol.gif",
    hp: 65,
    attack: 150,
    defense: 60,
    status: rarityChances.rare,
    height: pokemonSizes.huge
    },

    mega_scizor: {
    englishName: "Mega Scizor",
    koreanName: "메가핫삼",
    imageUrl: filePath + "mega_scizor.gif",
    hp: 70,
    attack: 150,
    defense: 140,
    status: rarityChances.rare,
    height: pokemonSizes.huge
    },

    meganium: {
    englishName: "Meganium",
    koreanName: "메가니움",
    imageUrl: filePath + "meganium.gif",
    hp: 80,
    attack: 82,
    defense: 100,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    meowth: {
    englishName: "Meowth",
    koreanName: "나옹",
    imageUrl: filePath + "meowth.gif",
    hp: 40,
    attack: 45,
    defense: 35,
    status: rarityChances.common,
    height: pokemonSizes.small
    },

    mew: {
    englishName: "Mew",
    koreanName: "뮤",
    imageUrl: filePath + "mew.gif",
    hp: 100,
    attack: 100,
    defense: 100,
    status: rarityChances.mythical, 
    height: pokemonSizes.medium
    },

    mightyena: {
    englishName: "Mightyena",
    koreanName: "그라에나",
    imageUrl: filePath + "mightyena.gif",
    hp: 70,
    attack: 90,
    defense: 70,
    status: rarityChances.uncommon,
    height: pokemonSizes.medium
    },

    munchlax: {
    englishName: "Munchlax",
    koreanName: "먹고자",
    imageUrl: filePath + "munchlax.gif",
    hp: 135,
    attack: 85,
    defense: 40,
    status: rarityChances.rare,
    height: pokemonSizes.small
    },

    quilladin: {
    englishName: "Quilladin",
    koreanName: "도치보구",
    imageUrl: filePath + "quilladin.gif",
    hp: 61,
    attack: 78,
    defense: 95,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    raichu: {
    englishName: "Raichu",
    koreanName: "라이츄",
    imageUrl: filePath + "raichu.gif",
    hp: 60,
    attack: 90,
    defense: 55,
    status: rarityChances.rare, 
    height: pokemonSizes.medium
    },

    riolu: {
    englishName: "Riolu",
    koreanName: "리오르",
    imageUrl: filePath + "riolu.gif",
    hp: 40,
    attack: 70,
    defense: 40,
    status: rarityChances.rare, 
    height: pokemonSizes.small
    },

    scyther: {
    englishName: "Scyther",
    koreanName: "스라크",
    imageUrl: filePath + "scyther.gif",
    hp: 70,
    attack: 110,
    defense: 80,
    status: rarityChances.rare,
    height: pokemonSizes.large
    },

    slowking: {
    englishName: "Slowking",
    koreanName: "야도킹",
    imageUrl: filePath + "slowking.gif",
    hp: 95,
    attack: 75,
    defense: 80,
    status: rarityChances.rare, 
    height: pokemonSizes.medium
    },

    sylveon: {
    englishName: "Sylveon",
    koreanName: "님피아",
    imageUrl: filePath + "sylveon.gif",
    hp: 95,
    attack: 65,
    defense: 65,
    status: rarityChances.rare,
    height: pokemonSizes.medium
    },

    vaporeon: {
    englishName: "Vaporeon",
    koreanName: "샤미드",
    imageUrl: filePath + "vaporeon.gif",
    hp: 130,
    attack: 65,
    defense: 60,
    status: rarityChances.rare, 
    height: pokemonSizes.medium
    },

    vigoroth: {
    englishName: "Vigoroth",
    koreanName: "발바로",
    imageUrl: filePath + "vigoroth.gif",
    hp: 80,
    attack: 80,
    defense: 80,
    status: rarityChances.uncommon,
    height: pokemonSizes.small
    },

    weavile: {
    englishName: "Weavile",
    koreanName: "포푸니라",
    imageUrl:  filePath + "weavile.gif",
    hp: 70,
    attack: 120,
    defense: 65,
    status: rarityChances.rare,
    height: pokemonSizes.medium
    },

    zacian: {
    englishName: "Zacian",
    koreanName: "자시안",
    imageUrl: filePath + "zacian.gif",
    hp: 92,
    attack: 130,
    defense: 115,
    status: rarityChances.legendary, 
    height: pokemonSizes.huge
    },

    zamazenta: {
    englishName: "Zamazenta",
    koreanName: "자마젠타",
    imageUrl: filePath + "zamazenta.gif",
    hp: 92,
    attack: 130,
    defense: 115,
    status: rarityChances.legendary,
    height: pokemonSizes.huge
    },

    zangoos: {
    englishName: "Zangoose",
    koreanName: "쟝고",
    imageUrl: filePath + "zangoose.gif",
    hp: 73,
    attack: 115,
    defense: 60,
    status: rarityChances.uncommon, 
    height: pokemonSizes.small
    },

    zapdos: {
    englishName: "Zapdos",
    koreanName: "썬더",
    imageUrl: filePath + "zapdos.gif",
    hp: 90,
    attack: 90,
    defense: 85,
    status: rarityChances.legendary,
    height: pokemonSizes.large
    }
};

export const backGroundImgs = {
    1:{
        imageUrl: filePathBackgrounds + "question_background_1.jpg",
        bottom: "30%",
        left: "56%",
    },
    2:{
        imageUrl: filePathBackgrounds + "question_background_2.jpg",
        bottom: "29%",
        left: "46%",
    },
    3:{
        imageUrl: filePathBackgrounds + "question_background_3.jpg",
        bottom: "30%",
        left: "56%",
    },
    4:{
        imageUrl: filePathBackgrounds + "question_background_4.jpg",
        bottom: "22%",
        left: "47%",
    },
    5:{
        imageUrl: filePathBackgrounds + "question_background_5.jpg",
        bottom: "31%",
        left: "42%",
    },
    6:{
        imageUrl: filePathBackgrounds + "question_background_6.jpg",
        bottom: "30%",
        left: "56%",
    },
    7:{
        imageUrl: filePathBackgrounds + "question_background_7.jpg",
        bottom: "30%",
        left: "56%",
    },
    8:{
        imageUrl: filePathBackgrounds + "question_background_8.jpg",
        bottom: "30%",
        left: "43%",
    },
    9:{
        imageUrl: filePathBackgrounds + "question_background_9.jpg",
        bottom: "30%",
        left: "48%",
    },
    10:{
        imageUrl: filePathBackgrounds + "question_background_10.jpg",
        bottom: "30%",
        left: "56%",
    },
    11:{
        imageUrl: filePathBackgrounds + "question_background_11.jpg",
        bottom: "30%",
        left: "56%",
    },
    12:{
        imageUrl: filePathBackgrounds + "question_background_12.jpg",
        bottom: "30%",
        left: "37%",
    },
    13:{
        imageUrl: filePathBackgrounds + "question_background_13.jpg",
        bottom: "30%",
        left: "56%",
    },
    14:{
        imageUrl: filePathBackgrounds + "question_background_14.jpg",
        bottom: "30%",
        left: "56%",
    },
    15:{
        imageUrl: filePathBackgrounds + "question_background_15.jpg",
        bottom: "30%",
        left: "56%",
    },
    16:{
        imageUrl: filePathBackgrounds + "question_background_16.jpg",
        bottom: "30%",
        left: "56%",
    },
    17:{
        imageUrl: filePathBackgrounds + "question_background_17.jpg",
        bottom: "30%",
        left: "56%",
    },
    18:{
        imageUrl: filePathBackgrounds + "question_background_18.jpg",
        bottom: "30%",
        left: "56%",
    },
    19:{
        imageUrl: filePathBackgrounds + "question_background_19.jpg",
        bottom: "30%",
        left: "56%",
    },
    20:{
        imageUrl: filePathBackgrounds + "question_background_20.jpg",
        bottom: "26%",
        left: "56%",
    },
    21:{
        imageUrl: filePathBackgrounds + "question_background_21.jpg",
        bottom: "30%",
        left: "56%",
    },
    22:{
        imageUrl: filePathBackgrounds + "question_background_22.jpg",
        bottom: "30%",
        left: "56%",
    },
    23:{
        imageUrl: filePathBackgrounds + "question_background_23.jpg",
        bottom: "33%",
        left: "41%",
    },
    24:{
        imageUrl: filePathBackgrounds + "question_background_24.jpg",
        bottom: "30%",
        left: "56%",
    },
    25:{
        imageUrl: filePathBackgrounds + "question_background_25.jpg",
        bottom: "30%",
        left: "56%",
    },
    26:{
        imageUrl: filePathBackgrounds + "question_background_26.jpg",
        bottom: "26%",
        left: "50%",
    },
    27:{
        imageUrl: filePathBackgrounds + "question_background_27.jpg",
        bottom: "30%",
        left: "56%",
    },
    28:{
        imageUrl: filePathBackgrounds + "question_background_28.jpg",
        bottom: "30%",
        left: "56%",
    },
    29:{
        imageUrl: filePathBackgrounds + "question_background_29.jpg",
        bottom: "30%",
        left: "56%",
    },
    30:{
        imageUrl: filePathBackgrounds + "question_background_30.jpg",
        bottom: "30%",
        left: "56%",
    },
    31:{
        imageUrl: filePathBackgrounds + "question_background_31.jpg",
        bottom: "30%",
        left: "56%",
    },
    32:{
        imageUrl: filePathBackgrounds + "question_background_32.jpg",
        bottom: "24%",
        left: "46%",
    },
    33:{
        imageUrl: filePathBackgrounds + "question_background_33.jpg",
        bottom: "33%",
        left: "47%",
    },
    34:{
        imageUrl: filePathBackgrounds + "question_background_34.jpg",
        bottom: "30%",
        left: "56%",
    },
    35:{
        imageUrl: filePathBackgrounds + "question_background_35.jpg",
        bottom: "30%",
        left: "56%",
    }
};

export const environments = [
    {
        name: "grassland",

        backgrounds: [
            backGroundImgs[6],
            backGroundImgs[15],
            backGroundImgs[18],
            backGroundImgs[19],
            backGroundImgs[22],
            backGroundImgs[27],
            backGroundImgs[29],
            backGroundImgs[33],
            backGroundImgs[34],
        ],

        pokemon: [
            pokemon.bellsprout,
            pokemon.girafarig,
            pokemon.meganium,
            pokemon.mareep,
            pokemon.meowth,
            pokemon.mightyena,
            pokemon.quilladin,
            pokemon.scyther,
            pokemon.vigoroth,
            pokemon.zangoos
        ]
    },

    {
        name: "volcano",

        backgrounds: [
            backGroundImgs[2],
            backGroundImgs[5],
            backGroundImgs[12],
            backGroundImgs[16],
        ],

        pokemon: [
            pokemon.charizard,
            pokemon.charizard_mega_x,
            pokemon.coalossal,
            pokemon.entei,
            pokemon.groudon
        ]
    },

    {
        name: "sea",

        backgrounds: [
            backGroundImgs[14],
            backGroundImgs[17],
            backGroundImgs[25],
            backGroundImgs[28],
            backGroundImgs[32],
            backGroundImgs[35]
        ],

        pokemon: [
            pokemon.buizel,
            pokemon.slowking,
            pokemon.vaporeon
        ]
    },

    {
        name: "desert",

        backgrounds: [
            backGroundImgs[1],
            backGroundImgs[4],
            backGroundImgs[11],
            backGroundImgs[13],
            backGroundImgs[23],
            backGroundImgs[25],
            backGroundImgs[31]
        ],

        pokemon: [
            pokemon.donphan,
            pokemon.garchomp,
            pokemon.gible,
            pokemon.groudon,
            pokemon.mightyena,
            pokemon.zangoos
        ]
    },

    {
        name: "tundra",

        backgrounds: [
            backGroundImgs[3],
            backGroundImgs[8]
        ],

        pokemon: [
            pokemon.glaceon,
            pokemon.weavile
        ]
    },

    {
        name: "mountain",

        backgrounds: [
            backGroundImgs[1],
            backGroundImgs[2],
            backGroundImgs[4],
            backGroundImgs[5],
            backGroundImgs[6],
            backGroundImgs[7],
            backGroundImgs[10],
            backGroundImgs[23],
            backGroundImgs[24],
            backGroundImgs[26]
        ],

        pokemon: [
            pokemon.garchomp,
            pokemon.gible,
            pokemon.hawlucha,
            pokemon.donphan,
            pokemon.scyther,
            pokemon.zapdos,
            pokemon.zacian,
            pokemon.zamazenta
        ]
    },

    {
        name: "forest",

        backgrounds: [
            backGroundImgs[20],
            backGroundImgs[22],
            backGroundImgs[30],
            backGroundImgs[33]
        ],

        pokemon: [
            pokemon.bellsprout,
            pokemon.celebi,
            pokemon.leafeon,
            pokemon.meganium,
            pokemon.scyther,
            pokemon.munchlax,
            pokemon.quilladin,
            pokemon.riolu
        ]
    },

    {
        name: "cave",

        backgrounds: [
            backGroundImgs[2],
            backGroundImgs[5],
            backGroundImgs[9],
            backGroundImgs[12],
            backGroundImgs[20],
            backGroundImgs[21],

        ],

        pokemon: [
            pokemon.abra,
            pokemon.azelf,
            pokemon.garchomp,
            pokemon.gible,
            pokemon.kirlia,
            pokemon.munchlax,
            pokemon.riolu,
            pokemon.slowking
        ]
    },

    {
        name: "urban",

        backgrounds: [
            backGroundImgs[13],
            backGroundImgs[15],
            backGroundImgs[20],
            backGroundImgs[21],
            backGroundImgs[23],
            backGroundImgs[25],
            backGroundImgs[32],
            backGroundImgs[33],

        ],

        pokemon: [
            pokemon.abra,
            pokemon.chatot,
            pokemon.elektross,
            pokemon.espon,
            pokemon.jolten,
            pokemon.luxio,
            pokemon.meowth,
            pokemon.raichu
        ]
    },

    {
        name: "haunted",

        backgrounds: [
            backGroundImgs[2],
            backGroundImgs[9],
            backGroundImgs[12],
            backGroundImgs[13],
            backGroundImgs[21],
            backGroundImgs[32]
        ],

        pokemon: [
            pokemon.driftblim,
            pokemon.mightyena,
            pokemon.slowking
        ]
    },

    {
        name: "psychic",

        backgrounds: [
            // urban / industrial
            backGroundImgs[13],
            backGroundImgs[15],
            backGroundImgs[20],
            backGroundImgs[21],

            // storm / mountain type environments
            backGroundImgs[24],
            backGroundImgs[26]
        ],

        pokemon: [
            pokemon.abra,
            pokemon.azelf,
            pokemon.celebi,
            pokemon.espon,
            pokemon.girafarig,
            pokemon.kirlia,
            pokemon.mew,
            pokemon.slowking,
            pokemon.sylveon
        ]
    },

    {
        name: "electric",

        backgrounds: [
           // urban / industrial
            backGroundImgs[13],
            backGroundImgs[15],
            backGroundImgs[20],
            backGroundImgs[21],

            // storm / mountain type environments
            backGroundImgs[24],
            backGroundImgs[26]
        ],

        pokemon: [
            pokemon.elektross,
            pokemon.jolten,
            pokemon.luxio,
            pokemon.mareep,
            pokemon.raichu,
            pokemon.zapdos
        ]
    },

];

export const pinEnvironments = {
    1:  "mountain",
    2:  "mountain",
    3:  "tundra",
    4:  "desert",
    5:  "forest",
    6:  "mountain",
    7:  "grassland",
    8:  "tundra",
    9:  "mountain",
    10: "mountain",
    11: "forest",
    12: "psychic",
    13: "psychic",
    14: "mountain",
    15: "sea",
    16: "mountain",
    17: "volcano",
    18: "sea",
    19: "psychic",
    20: "volcano",
    21: "volcano",
    22: "cave",
    23: "desert",
    24: "grassland",
    25: "haunted",
    26: "mountain",
    27: "cave",
    28: "urban",
    29: "mountain",
    30: "mountain",
    31: "grassland",
    32: "forest",
    33: "forest",
    34: "desert",
    35: "sea",
    36: "mountain",
    37: "grassland",
    38: "haunted",
    39: "sea",
    40: "electric",
    41: "mountain",
    42: "sea",
    43: "tundra",
    44: "sea",
    A: "sea",
    B: "grasslands",
    C: "sea"
};

export const pokeballStatusData = {

    basic: {
        catchChance: 70,
        xpMultiplier: 1.0,
        glowClass: "pokeball-glow-basic"
    },

    good: {
        catchChance: 78,
        xpMultiplier: 1.25,
        glowClass: "pokeball-glow-good"
    },

    great: {
        catchChance: 86,
        xpMultiplier: 1.5,
        glowClass: "pokeball-glow-great"
    },

    risky: {
        catchChance: 55,
        xpMultiplier: 2.25,
        glowClass: "pokeball-glow-risky"
    },

    elite: {
        catchChance: 100,
        xpMultiplier: 1.75,
        glowClass: "pokeball-glow-elite"
    }
};

export const pokeballs = {
    1:{
        imageUrl: filePathPokeballs + "Pokeball_1.png",
        status: pokeballStatusData.good
    },
    2:{
        imageUrl: filePathPokeballs + "Pokeball_2.png",
        status: pokeballStatusData.basic
    },
    3:{
        imageUrl: filePathPokeballs + "Pokeball_3.png",
        status: pokeballStatusData.good
    },
    4:{
        imageUrl: filePathPokeballs + "Pokeball_4.png",
        status: pokeballStatusData.great
    },
    5:{
        imageUrl: filePathPokeballs + "Pokeball_5.png",
        status: pokeballStatusData.good
    },
    6:{
        imageUrl: filePathPokeballs + "Pokeball_6.png",
        status: pokeballStatusData.risky
    },
    7:{
        imageUrl: filePathPokeballs + "Pokeball_7.png",
        status: pokeballStatusData.basic
    },
    8:{
        imageUrl: filePathPokeballs + "Pokeball_8.png",
        status: pokeballStatusData.good
    },
    9:{
        imageUrl: filePathPokeballs + "Pokeball_9.png",
        status: pokeballStatusData.basic
    },
    10:{
        imageUrl: filePathPokeballs + "Pokeball_10.png",
        status: pokeballStatusData.good
    },
    11:{
        imageUrl: filePathPokeballs + "Pokeball_11.png",
        status: pokeballStatusData.great
    },
    12:{
        imageUrl: filePathPokeballs + "Pokeball_12.png",
        status: pokeballStatusData.good
    },
    13:{
        imageUrl: filePathPokeballs + "Pokeball_13.png",
        status: pokeballStatusData.risky
    },
    14:{
        imageUrl: filePathPokeballs + "Pokeball_14.png",
        status: pokeballStatusData.basic
    },
    15:{
        imageUrl: filePathPokeballs + "Pokeball_15.png",
        status: pokeballStatusData.good
    },
    16:{
        imageUrl: filePathPokeballs + "Pokeball_16.png",
        status: pokeballStatusData.risky
    },
    17:{
        imageUrl: filePathPokeballs + "Pokeball_17.png",
        status: pokeballStatusData.elite
    },
    18:{
        imageUrl: filePathPokeballs + "Pokeball_18.png",
        status: pokeballStatusData.great
    },
    19:{
        imageUrl: filePathPokeballs + "Pokeball_19.png",
        status: pokeballStatusData.good
    },
    20:{
        imageUrl: filePathPokeballs + "Pokeball_20.png",
        status: pokeballStatusData.basic
    },
    21:{
        imageUrl: filePathPokeballs + "Pokeball_21.png",
        status: pokeballStatusData.risky
    },
    22:{
        imageUrl: filePathPokeballs + "Pokeball_22.png",
        status: pokeballStatusData.basic
    },
    23:{
        imageUrl: filePathPokeballs + "Pokeball_23.png",
        status: pokeballStatusData.great
    },
    24:{
        imageUrl: filePathPokeballs + "Pokeball_24.png",
        status: pokeballStatusData.good
    },
    25:{
        imageUrl: filePathPokeballs + "Pokeball_25.png",
        status: pokeballStatusData.great
    },
    26:{
        imageUrl: filePathPokeballs + "Pokeball_26.png",
        status: pokeballStatusData.great
    },
    27:{
        imageUrl: filePathPokeballs + "Pokeball_27.png",
        status: pokeballStatusData.great
    },
    28:{
        imageUrl: filePathPokeballs + "Pokeball_28.png",
        status: pokeballStatusData.good
    },
    29:{
        imageUrl: filePathPokeballs + "Pokeball_29.png",
        status: pokeballStatusData.risky
    },
    30:{
        imageUrl: filePathPokeballs + "Pokeball_30.png",
        status: pokeballStatusData.good
    },
    31:{
        imageUrl: filePathPokeballs + "Pokeball_31.png",
        status: pokeballStatusData.risky
    },
    32:{
        imageUrl: filePathPokeballs + "Pokeball_32.png",
        status: pokeballStatusData.risky
    },
    33:{
        imageUrl: filePathPokeballs + "Pokeball_33.png",
        status: pokeballStatusData.risky
    },
    34:{
        imageUrl: filePathPokeballs + "Pokeball_34.png",
        status: pokeballStatusData.basic
    },
    35:{
        imageUrl: filePathPokeballs + "Pokeball_35.png",
        status: pokeballStatusData.great
    },
    36:{
        imageUrl: filePathPokeballs + "Pokeball_36.png",
        status: pokeballStatusData.good
    },
    37:{
        imageUrl: filePathPokeballs + "Pokeball_37.png",
        status: pokeballStatusData.good
    },
    38:{
        imageUrl: filePathPokeballs + "Pokeball_38.png",
        status: pokeballStatusData.great
    },
    39:{
        imageUrl: filePathPokeballs + "Pokeball_39.png",
        status: pokeballStatusData.basic
    },
    40:{
        imageUrl: filePathPokeballs + "Pokeball_40.png",
        status: pokeballStatusData.good
    },
    41:{
        imageUrl: filePathPokeballs + "Pokeball_41.png",
        status: pokeballStatusData.risky
    },
    42:{
        imageUrl: filePathPokeballs + "Pokeball_42.png",
        status: pokeballStatusData.good
    },
    43:{
        imageUrl: filePathPokeballs + "Pokeball_43.png",
        status: pokeballStatusData.great
    },
    44:{
        imageUrl: filePathPokeballs + "Pokeball_44.png",
        status: pokeballStatusData.good
    },
    45:{
        imageUrl: filePathPokeballs + "Pokeball_45.png",
        status: pokeballStatusData.risky
    },
    46:{
        imageUrl: filePathPokeballs + "Pokeball_46.png",
        status: pokeballStatusData.good
    }
}

export const questions = [

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    },

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    }

];

