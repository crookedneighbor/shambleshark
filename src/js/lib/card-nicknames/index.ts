import guildsOfRavnica from "./grn";
import ravnicaAllegiance from "./rna";
import warOfTheSpark from "./war";
import modernHorizons from "./mh1";
import coreset2020 from "./m20";
import commander2019 from "./c19";
import throneOfEldraine from "./eld";
import therosByeondDeath from "./thb";
import ikoria from "./iko";
import commander2020 from "./c20";
import coreset2021 from "./m21";
import zendikarRising from "./znr";
import commanderLegends from "./cmr";
import kaldheim from "./khm";

type NickNameMetaData = {
  realName: string[];
  setCode: string;
  collectorNumber: string;
  nickname: string[];
  source: string;
};

const nicknames: NickNameMetaData[] = [
  ...guildsOfRavnica,
  ...ravnicaAllegiance,
  ...warOfTheSpark,
  ...modernHorizons,
  ...coreset2020,
  ...commander2019,
  ...throneOfEldraine,
  ...therosByeondDeath,
  ...ikoria,
  ...commander2020,
  ...coreset2021,
  ...zendikarRising,
  ...commanderLegends,
  ...kaldheim,
];

export default nicknames;
