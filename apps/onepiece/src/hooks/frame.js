import { useContext } from 'react';
import { LocationContext } from 'components/Stack/RouteContext';
import { FrameContext } from 'containers/Frame/FrameContext';

const useLocation = () => useContext(LocationContext);

const useFrame = () => useContext(FrameContext);

export { useLocation, useFrame };
