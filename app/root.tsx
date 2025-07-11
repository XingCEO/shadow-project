import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useState } from "react";
import AchievementSystem from "~/components/AchievementSystem";
import AchievementNotification from "~/components/AchievementNotification";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap",
  },
];

export default function App() {
  const [currentAchievement, setCurrentAchievement] = useState<{
    badge_type: string;
    badge_name: string;
    description: string;
    value?: number;
  } | null>(null);

  const handleAchievementUnlocked = (achievement: {
    badge_type: string;
    badge_name: string;
    description: string;
    value?: number;
  }) => {
    setCurrentAchievement(achievement);
  };

  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>影子計劃 - 智慧學習系統</title>
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased bg-shadow-50">
        <Outlet />
        <AchievementSystem onAchievementUnlocked={handleAchievementUnlocked} />
        <AchievementNotification
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}