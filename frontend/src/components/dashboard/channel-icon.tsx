import {
  Webhook,
  Mail,
  MessageCircle,
  Hash,
  Smartphone,
  BellRing,
  AppWindow,
  type LucideIcon,
} from "lucide-react";
import type { ChannelType, DeliveryChannel } from "@/src/lib/mock-data";

export const channelIcons: Record<ChannelType, LucideIcon> = {
  webhook: Webhook,
  email: Mail,
  telegram: MessageCircle,
  discord: Hash,
};

export const deliveryChannelIcons: Record<DeliveryChannel, LucideIcon> = {
  email: Mail,
  sms: Smartphone,
  push: BellRing,
  "in-app": AppWindow,
};

export function ChannelIcon({
  type,
  className,
}: {
  type: ChannelType;
  className?: string;
}) {
  const Icon = channelIcons[type];
  return <Icon className={className} />;
}
