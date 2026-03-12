"use client";
/**
 * Icon — thin wrapper around Lucide React icons.
 *
 * Usage:
 *   <Icon name="Zap" size={20} color={t.green} />
 *   <Icon name="Moon" size={18} strokeWidth={2} />
 *
 * All icon names are PascalCase Lucide names (Zap, Sun, Moon, Map, etc.)
 * Full list: https://lucide.dev/icons/
 */

// Named imports keep the bundle small — only icons we use are included.
import {
  Zap, Sun, Moon, Map, Leaf, Plug, ShoppingBag, GitCompare,
  Link as LinkIcon, Menu, X, ChevronRight, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, Check, Info, AlertTriangle, AlertCircle,
  TrendingUp, TrendingDown, BarChart2, Activity, DollarSign,
  Home, Settings, Copy, Share2, Bookmark, Star, Eye, EyeOff,
  RefreshCw, Clock, Calendar, MapPin, Globe, Database,
  Battery, BatteryCharging, Car, Gauge, Wind, Droplets,
  Thermometer, CloudSun, FlameKindling, Flame,
  Calculator, PieChart, Layers, Grid, List,
  User, Users, Building, Shield, Lock, Unlock,
  Download, Upload, ExternalLink, Maximize2, Minimize2,
  Plus, Minus, Search, Filter, SlidersHorizontal,
  Lightbulb, Wrench, Truck, Wallet, CreditCard,
  LayoutGrid, SquareDashed,
  // Icons used in PROCESS / WHY_WATTFULL / StatPill
  FileSearch,
  CircleArrowRight,  // lucide >=0.396 renamed ArrowRightCircle → CircleArrowRight
  Compass,
  Fuel,
  Target,
  Navigation,
  Route,
  CircleCheck,
  Sparkles,
  FileText,
} from "lucide-react";

const ICONS = {
  Zap, Sun, Moon, Map, Leaf, Plug, ShoppingBag, GitCompare,
  Link: LinkIcon, Menu, X, ChevronRight, ChevronDown, ChevronUp,
  ArrowRight, ArrowLeft, Check, Info, AlertTriangle, AlertCircle,
  TrendingUp, TrendingDown, BarChart2, Activity, DollarSign,
  Home, Settings, Copy, Share2, Bookmark, Star, Eye, EyeOff,
  RefreshCw, Clock, Calendar, MapPin, Globe, Database,
  Battery, BatteryCharging, Car, Gauge, Wind, Droplets,
  Thermometer, CloudSun, FlameKindling, Flame,
  Calculator, PieChart, Layers, Grid, List,
  User, Users, Building, Shield, Lock, Unlock,
  Download, Upload, ExternalLink, Maximize2, Minimize2,
  Plus, Minus, Search, Filter, SlidersHorizontal,
  Lightbulb, Wrench, Truck, Wallet, CreditCard,
  LayoutGrid, SquareDashed,
  // New
  FileSearch,
  ArrowRightCircle: CircleArrowRight,  // alias for backwards compat
  CircleArrowRight,
  Compass,
  Fuel,
  Target,
  Navigation,
  Route,
  CircleCheck,
  Sparkles,
  FileText,
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
