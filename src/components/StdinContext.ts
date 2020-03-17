import { createContext } from "react";
import { ReadStream } from "tty";

export interface StdinContext {
	stdin: ReadStream;
	setRawMode: (value: boolean) => void;
	isRawModeSupported: boolean;
}

export default createContext<StdinContext>({
	stdin: undefined,
	setRawMode: undefined,
	isRawModeSupported: false
});
