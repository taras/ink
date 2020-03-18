import {createContext} from 'react';

export interface StdinContext {
	stdin: NodeJS.ReadStream;
	setRawMode: (value: boolean) => void;
	isRawModeSupported: boolean;
}

export default createContext<StdinContext>({
	stdin: undefined,
	setRawMode: undefined,
	isRawModeSupported: false
});
