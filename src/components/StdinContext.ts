import { createContext } from 'react';

export default createContext({
	stdin: undefined,
	setRawMode: undefined,
	isRawModeSupported: false
});
