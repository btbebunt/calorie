import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calorie Tracker",
    short_name: "Calorie Tracker",
    description: "Private Calorie Tracker for Family",
    start_url: "/",
    display: "standalone",
    background_color: "#ecfdf5",
    theme_color: "#ecfdf5",
    orientation: "portrait",
  };
}
