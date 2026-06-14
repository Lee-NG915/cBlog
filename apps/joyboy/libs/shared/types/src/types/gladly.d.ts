type GladlyMessage = {
  type: string;
  text: string;
};

type GladlyUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  jwt?: string | (() => Promise<string>);
};

type GladlyUserInfo = {
  name: string;
  type: string;
  identityType: string;
  identity: string;
  hasOpenConversation: boolean;
};

type GladlyAvailability = 'AVAILABLE' | 'UNAVAILABLE_OFFICE_CLOSED' | 'UNAVAILABLE_BUSY';

type GladlyEvent =
  | 'availability:change'
  | 'conversation:ended'
  | 'conversation:started'
  | 'campaign:triggered'
  | 'customer:onboarded'
  | 'message:received'
  | 'message:sent'
  | 'quick-action:selected'
  | 'search:result-selected'
  | 'sidekick:closed'
  | 'sidekick:opened';

declare global {
  interface Window {
    Gladly?: {
      init?: (config?: { appId: string; autoShowButton?: boolean }) => Promise<void>;
      show?: () => void;
      close?: () => void;
      startConversation?: (messages: GladlyMessage[]) => void;
      setUser?: (user: GladlyUser) => void;
      getUser?: () => GladlyUserInfo | undefined;
      clearUser?: () => Promise<void>;
      navigate?: () => void;
      getAvailability?: () => GladlyAvailability;
      on?: (event: GladlyEvent, callback: (...args: any[]) => void) => () => void;
      applyCampaign?: (campaignId: string) => void;
    };
  }
}

export {};
