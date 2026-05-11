"use client";
/**
 * Icon — thin wrapper around Lucide React icons.
 * Named imports only — unused icons are tree-shaken at build time.
 * Full list: https://lucide.dev/icons/
 */
import {
  Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  ArrowRightCircle, BarChart2, Battery, BatteryCharging,
  Bookmark, Building, Calculator, Calendar, Car,
  Check, ChevronDown, ChevronRight, ChevronUp, CircleArrowRight,
  CircleCheck, Clock, CloudSun, Compass, Copy, CreditCard,
  Database, DollarSign, Download, Droplets, ExternalLink,
  Eye, EyeOff, FileSearch, FileText, Filter, Flame,
  FlameKindling, Fuel, Gauge, GitCompare, Globe, Grid,
  Home, Info, LayoutGrid, Layers, Leaf, Lightbulb,
  Link as LinkIcon, List, Lock, Map, MapPin, Maximize2,
  Menu, Minimize2, Minus, Moon, Navigation, PieChart,
  Plug, Plus, RefreshCw, Route, Search, Settings,
  Shield, ShoppingBag, Share2, SlidersHorizontal, Sparkles,
  SquareDashed, Star, Sun, Target, Thermometer, TrendingDown,
  TrendingUp, Truck, Unlock, Upload, User, Users,
  Wallet, Wind, Wrench, X, Zap,
} from "lucide-react";

const ICONS = {
  Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  ArrowRightCircle, BarChart2, Battery, BatteryCharging,
  Bookmark, Building, Calculator, Calendar, Car,
  Check, ChevronDown, ChevronRight, ChevronUp, CircleArrowRight,
  CircleCheck, Clock, CloudSun, Compass, Copy, CreditCard,
  Database, DollarSign, Download, Droplets, ExternalLink,
  Eye, EyeOff, FileSearch, FileText, Filter, Flame,
  FlameKindling, Fuel, Gauge, GitCompare, Globe, Grid,
  Home, Info, LayoutGrid, Layers, Leaf, Lightbulb,
  Link: LinkIcon, List, Lock, Map, MapPin, Maximize2,
  Menu, Minimize2, Minus, Moon, Navigation, PieChart,
  Plug, Plus, RefreshCw, Route, Search, Settings,
  Shield, ShoppingBag, Share2, SlidersHorizontal, Sparkles,
  SquareDashed, Star, Sun, Target, Thermometer, TrendingDown,
  TrendingUp, Truck, Unlock, Upload, User, Users,
  Wallet, Wind, Wrench, X, Zap,
};

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.75,
  style,
  className,
  ...props
}) {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Icon] Unknown icon: "${name}"`);
    }
    return null;
  }
  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  );
}
