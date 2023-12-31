import { h, render } from "preact";
import App from "./containers/App";
import "normalize.css";
import "@picocss/pico";
import "./styles.css";
import "./fonts/CA Saygon Text/stylesheet.css";

const container = document.createElement("div");
document.body.appendChild(container);
render(<App />, container);
