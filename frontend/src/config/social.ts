import { Instagram, Facebook, LucideIcon } from "lucide-react";

export interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/myhelper.me",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/profile.php?id=61582266767267",
    label: "Facebook",
  },
];
