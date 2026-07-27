"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, UserData } from "@/lib/api";

export default function UserProgress() {
  const [user, setUser] = useState<UserData | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.getUser().then(setUser).catch(console.error);
  }, [pathname]);

  // Hide during lessons
  if (pathname.startsWith("/lesson")) return null;

  if (!user) return null;

  return (
    <aside className="right-sidebar">
      <div className="user-stats">
        <div className="stat-row">
          <span className="stat-icon">🇪🇸</span>
          <div>
            <div className="stat-value">Spanish</div>
            <div className="stat-label">Current course</div>
          </div>
        </div>
        <div className="stat-row">
          <span className="stat-icon">🔥</span>
          <div>
            <div className="stat-value" style={{ color: "var(--duo-orange)" }}>{user.streak_days}</div>
            <div className="stat-label">Day streak</div>
          </div>
        </div>
        <div className="stat-row">
          <span className="stat-icon">⚡</span>
          <div>
            <div className="stat-value" style={{ color: "var(--duo-gold)" }}>{user.xp}</div>
            <div className="stat-label">Total XP</div>
          </div>
        </div>
        <div className="stat-row">
          <span className="stat-icon">❤️</span>
          <div>
            <div className="stat-value" style={{ color: "var(--duo-red)" }}>{user.hearts}</div>
            <div className="stat-label">Hearts</div>
          </div>
        </div>
        <div className="stat-row">
          <span className="stat-icon">💎</span>
          <div>
            <div className="stat-value" style={{ color: "var(--duo-purple)" }}>{user.gems}</div>
            <div className="stat-label">Gems</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
