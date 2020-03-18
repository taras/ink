import React from 'react';

interface AppContextValue {
	exit: (error?: number | Error) => void;
}

export default React.createContext<AppContextValue>({
	exit: () => {}
});
