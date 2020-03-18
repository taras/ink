import React from 'react';

export default React.createContext({
	exit: (error?: number | Error) => {}
});
