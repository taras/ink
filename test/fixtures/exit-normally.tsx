import React from "react";
import { Box, render } from "../..";

const { waitUntilExit } = render(<Box>Hello World</Box>, {
	experimental: process.env.EXPERIMENTAL === "true"
});

waitUntilExit().then(() => console.log("exited"));
