/**
 * Single icon source for the whole app (Phosphor Icons).
 * Small UI icons default to the "bold" weight; pass weight="duotone" for feature tiles.
 */
import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  ArrowCounterClockwise as PhArrowCounterClockwise,
  ArrowLeft as PhArrowLeft,
  ArrowRight as PhArrowRight,
  ArrowUpRight as PhArrowUpRight,
  Article as PhArticle,
  Baby as PhBaby,
  Bird as PhBird,
  Briefcase as PhBriefcase,
  Bug as PhBug,
  Buildings as PhBuildings,
  Calculator as PhCalculator,
  CalendarBlank as PhCalendarBlank,
  CalendarCheck as PhCalendarCheck,
  CaretDown as PhCaretDown,
  CaretRight as PhCaretRight,
  Certificate as PhCertificate,
  Check as PhCheck,
  CheckCircle as PhCheckCircle,
  CircleNotch as PhCircleNotch,
  Clock as PhClock,
  Coins as PhCoins,
  Compass as PhCompass,
  Copy as PhCopy,
  Cpu as PhCpu,
  CurrencyInr as PhCurrencyInr,
  DownloadSimple as PhDownloadSimple,
  EnvelopeSimple as PhEnvelopeSimple,
  Eye as PhEye,
  FloppyDisk as PhFloppyDisk,
  Funnel as PhFunnel,
  GearSix as PhGearSix,
  GridNine as PhGridNine,
  Hammer as PhHammer,
  HandHeart as PhHandHeart,
  Handshake as PhHandshake,
  HardHat as PhHardHat,
  Heart as PhHeart,
  House as PhHouse,
  Images as PhImages,
  Info as PhInfo,
  Leaf as PhLeaf,
  Lightning as PhLightning,
  List as PhList,
  Lock as PhLock,
  MagnifyingGlass as PhMagnifyingGlass,
  MapPin as PhMapPin,
  Medal as PhMedal,
  NavigationArrow as PhNavigationArrow,
  PaperPlaneTilt as PhPaperPlaneTilt,
  PencilSimple as PhPencilSimple,
  Phone as PhPhone,
  Play as PhPlay,
  PlayCircle as PhPlayCircle,
  Plus as PhPlus,
  Question as PhQuestion,
  Quotes as PhQuotes,
  Receipt as PhReceipt,
  Ruler as PhRuler,
  SealCheck as PhSealCheck,
  Selection as PhSelection,
  ShareNetwork as PhShareNetwork,
  ShieldCheck as PhShieldCheck,
  SignIn as PhSignIn,
  SignOut as PhSignOut,
  SlidersHorizontal as PhSlidersHorizontal,
  Smiley as PhSmiley,
  Sparkle as PhSparkle,
  SquaresFour as PhSquaresFour,
  Stack as PhStack,
  Star as PhStar,
  Tag as PhTag,
  Target as PhTarget,
  ThumbsUp as PhThumbsUp,
  Toolbox as PhToolbox,
  Trash as PhTrash,
  User as PhUser,
  Users as PhUsers,
  VideoCamera as PhVideoCamera,
  Wallet as PhWallet,
  WarningCircle as PhWarningCircle,
  WhatsappLogo as PhWhatsappLogo,
  Wind as PhWind,
  Wrench as PhWrench,
  X as PhX,
} from "@phosphor-icons/react/ssr";

type Weight = NonNullable<IconProps["weight"]>;

function make(Icon: ComponentType<IconProps>, weight: Weight = "bold") {
  return function AppIcon(props: IconProps) {
    return <Icon weight={weight} aria-hidden="true" {...props} />;
  };
}

export const AlertCircle = make(PhWarningCircle);
export const ArrowLeft = make(PhArrowLeft);
export const ArrowRight = make(PhArrowRight);
export const BadgeCheck = make(PhSealCheck);
export const Bird = make(PhBird);
export const Bug = make(PhBug);
export const Calculator = make(PhCalculator);
export const CalendarCheck = make(PhCalendarCheck);
export const CalendarDays = make(PhCalendarBlank);
export const Check = make(PhCheck);
export const CheckCircle2 = make(PhCheckCircle);
export const ChevronRight = make(PhCaretRight);
export const Clock = make(PhClock);
export const Compass = make(PhCompass);
export const Copy = make(PhCopy);
export const Download = make(PhDownloadSimple);
export const Eye = make(PhEye);
export const Filter = make(PhFunnel);
export const Grid3x3 = make(PhGridNine);
export const Hammer = make(PhHammer);
export const HandHeart = make(PhHandHeart);
export const Home = make(PhHouse);
export const Images = make(PhImages);
export const IndianRupee = make(PhCurrencyInr);
export const Info = make(PhInfo);
export const Layers = make(PhStack);
export const LayoutDashboard = make(PhSquaresFour);
export const Loader2 = make(PhCircleNotch);
export const Lock = make(PhLock);
export const LogIn = make(PhSignIn);
export const LogOut = make(PhSignOut);
export const Mail = make(PhEnvelopeSimple);
export const MapPin = make(PhMapPin);
export const Menu = make(PhList);
export const MessageCircle = make(PhWhatsappLogo);
export const Navigation = make(PhNavigationArrow);
export const Pencil = make(PhPencilSimple);
export const Phone = make(PhPhone);
export const Play = make(PhPlay, "fill");
export const PlayCircle = make(PhPlayCircle);
export const Plus = make(PhPlus);
export const ReceiptText = make(PhReceipt);
export const RotateCcw = make(PhArrowCounterClockwise);
export const Ruler = make(PhRuler);
export const Save = make(PhFloppyDisk);
export const Search = make(PhMagnifyingGlass);
export const Send = make(PhPaperPlaneTilt);
export const Settings = make(PhGearSix);
export const Share2 = make(PhShareNetwork);
export const ShieldCheck = make(PhShieldCheck);
export const Sliders = make(PhSlidersHorizontal);
export const Sparkles = make(PhSparkle);
export const SquareDashedMousePointer = make(PhSelection);
export const Star = make(PhStar);
export const Tag = make(PhTag);
export const Trash2 = make(PhTrash);
export const User = make(PhUser);
export const Users = make(PhUsers);
export const Video = make(PhVideoCamera);
export const Wallet = make(PhWallet);
export const Wrench = make(PhWrench);
export const X = make(PhX);
export const ArrowUpRight = make(PhArrowUpRight);
export const Article = make(PhArticle);
export const Baby = make(PhBaby);
export const Briefcase = make(PhBriefcase);
export const Buildings = make(PhBuildings);
export const CaretDown = make(PhCaretDown);
export const Certificate = make(PhCertificate);
export const Coins = make(PhCoins);
export const Cpu = make(PhCpu);
export const Handshake = make(PhHandshake);
export const HardHat = make(PhHardHat);
export const Heart = make(PhHeart);
export const Leaf = make(PhLeaf);
export const Lightning = make(PhLightning);
export const Medal = make(PhMedal);
export const Question = make(PhQuestion);
export const Quotes = make(PhQuotes);
export const Smiley = make(PhSmiley);
export const Target = make(PhTarget);
export const ThumbsUp = make(PhThumbsUp);
export const Toolbox = make(PhToolbox);
export const Wind = make(PhWind);
