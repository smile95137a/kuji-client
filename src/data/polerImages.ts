// src/data/polerImages.ts
import polerA from '@/assets/image/poler-A.png';
import polerB from '@/assets/image/poler-B.png';
import polerC from '@/assets/image/poler-C.png';
import polerD from '@/assets/image/poler-D.png';
import polerE from '@/assets/image/poler-E.png';
import polerF from '@/assets/image/poler-F.png';
import polerG from '@/assets/image/poler-G.png';
import polerH from '@/assets/image/poler-H.png';
import polerI from '@/assets/image/poler-I.png';
import polerJ from '@/assets/image/poler-J.png';
import polerK from '@/assets/image/poler-K.png';
import polerL from '@/assets/image/poler-L.png';
import polerM from '@/assets/image/poler-M.png';
import polerN from '@/assets/image/poler-N.png';
import polerO from '@/assets/image/poler-O.png';
import polerP from '@/assets/image/poler-P.png';
import polerQ from '@/assets/image/poler-Q.png';
import polerR from '@/assets/image/poler-R.png';
import polerS from '@/assets/image/poler-S.png';
import polerT from '@/assets/image/poler-T.png';
import polerU from '@/assets/image/poler-U.png';
import polerV from '@/assets/image/poler-V.png';
import polerW from '@/assets/image/poler-W.png';
import polerX from '@/assets/image/poler-X.png';
import polerY from '@/assets/image/poler-Y.png';
import polerZ from '@/assets/image/poler-Z.png';
import polerLast from '@/assets/image/poler-last.png';
import polerSP from '@/assets/image/poler-SP.png';

export type PolerLevel =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z'
  | 'LAST'
  | 'SP';

const polerImages: Record<PolerLevel, string> = {
  A: polerA,
  B: polerB,
  C: polerC,
  D: polerD,
  E: polerE,
  F: polerF,
  G: polerG,
  H: polerH,
  I: polerI,
  J: polerJ,
  K: polerK,
  L: polerL,
  M: polerM,
  N: polerN,
  O: polerO,
  P: polerP,
  Q: polerQ,
  R: polerR,
  S: polerS,
  T: polerT,
  U: polerU,
  V: polerV,
  W: polerW,
  X: polerX,
  Y: polerY,
  Z: polerZ,
  LAST: polerLast,
  SP: polerSP,
};

export default polerImages;
