import document from "document";
import { logger } from "../../../common/logger";

export const toggleDemoFlag = on => {
  const demoIcon = document.getElementById("demo");
  demoIcon.style.display = on ? "inline" : "none";
};