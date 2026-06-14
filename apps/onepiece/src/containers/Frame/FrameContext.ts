import { createContext } from 'react';

export type FrameContextType = { openModal: (name: string, { ...rest }: any) => void };

const FrameContext = createContext<FrameContextType | null>(null);

export { FrameContext };
