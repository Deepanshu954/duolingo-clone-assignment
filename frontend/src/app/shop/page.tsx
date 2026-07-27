"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Heart, Gem, Shield, Zap, Sparkles, Gift, Check, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { RefillModal } from "@/components/RefillModal";
import { CustomAlertModal, CustomAlertOptions } from "@/components/CustomAlertModal";
import { api, UserData } from "@/lib/api";
import { soundFX } from "@/utils/soundFX";

export default function ShopPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [isRefillOpen, setIsRefillOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<CustomAlertOptions | null>(null);

  const loadUser = async () => {
    try {
      const data = await api.getUser();
      setUser(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    void loadUser();
  }, []);

  const showAlert = (message: string, title?: string, type: CustomAlertOptions['type'] = 'info') => {
    setAlertOptions({ message, title, type });
  };

  const handleRefillConfirm = async () => {
    try {
      await api.refillHearts();
      await loadUser();
      setIsRefillOpen(false);
      soundFX.playCorrect();
      showAlert('Your hearts are full again.', 'Hearts Refilled', 'success');
    } catch (error: unknown) {
      soundFX.playWrong();
      showAlert(error instanceof Error ? error.message : 'Failed to refill hearts', 'Refill Error', 'error');
    }
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || redeeming) return;
    setRedeeming(true);

    try {
      soundFX.playClick();
      const res = await api.redeemCoupon(couponCode);
      await loadUser();
      setCouponCode("");
      soundFX.playFinish();
      showAlert(res.message, "Coupon Redeemed! 💎", "success");
    } catch (error: unknown) {
      soundFX.playWrong();
      showAlert(
        error instanceof Error ? error.message : "Invalid coupon code",
        "Redemption Failed",
        "error"
      );
    } finally {
      setRedeeming(false);
    }
  };

  const handleBuyGems = async (amount: number, packName: string) => {
    try {
      soundFX.playClick();
      const res = await api.buyGems(amount);
      await loadUser();
      soundFX.playCorrect();
      showAlert(`You acquired ${amount} Diamonds (${packName})!`, "Purchase Successful", "success");
    } catch (error: unknown) {
      soundFX.playWrong();
      showAlert(error instanceof Error ? error.message : "Failed to buy gems", "Purchase Error", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-slate-900 dark:text-slate-100 md:pl-64">
      <Header user={user} onRefillHearts={() => setIsRefillOpen(true)} />
      <Sidebar />

      <div className="flex justify-center">
        <main className="flex-1 px-4 py-8 pb-24 md:max-w-2xl space-y-8">
          {/* Shop Hero */}
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-md">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-gray-800 dark:text-slate-100">Duolingo Shop</h1>
            <p className="mt-1 text-sm font-bold text-gray-500 dark:text-slate-400">
              Redeem promo codes or refill your hearts!
            </p>
          </div>
          {/* Special Coupon Promo Box (Hidden if redeemed) */}
          {!user?.has_redeemed_scaler95 && (
            <div className="rounded-3xl border-4 border-yellow-300 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-6 text-yellow-950 shadow-xl dark:border-yellow-600 mb-8">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-yellow-900">
                <Gift className="h-5 w-5 fill-yellow-200 stroke-yellow-900 animate-bounce" /> Special Promo Reward
              </div>
              <h2 className="mt-1 text-2xl font-black">Have a Coupon Code?</h2>
              <p className="mt-1 text-xs font-extrabold text-yellow-900/80">
                Use secret code <span className="underline font-black bg-yellow-300 px-1.5 py-0.5 rounded-lg text-yellow-950">scaler95</span> to instantly get 2,000 Free Diamonds (One-time use)!
              </p>

              <form onSubmit={handleRedeemCoupon} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code (e.g. scaler95)..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 rounded-2xl border-2 border-yellow-600 bg-white/90 px-4 py-3 font-extrabold text-gray-800 placeholder-gray-400 outline-none focus:bg-white text-sm"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim() || redeeming}
                  className="btn-3d btn-3d-green px-6 py-3 text-xs font-black flex items-center gap-1.5"
                >
                  {redeeming ? "REDEEMING..." : "REDEEM"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
          {/* Standard Power-Ups */}
          <div>
            <h2 className="text-xl font-black mb-4">Power-Ups & Restores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heart Refill */}
              <div className="duo-card p-6 flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 mb-3">
                  <Heart className="h-8 w-8 fill-red-500" />
                </div>
                <h3 className="text-lg font-black">Refill Hearts</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 mb-4">
                  Get full hearts (5/5) so you can keep practicing.
                </p>
                <div className="mt-auto w-full">
                  <button
                    onClick={() => setIsRefillOpen(true)}
                    className="btn-3d btn-3d-green w-full py-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Gem className="h-4 w-4 fill-sky-300" /> 350 GEMS
                  </button>
                </div>
              </div>

              {/* Streak Freeze */}
              <div className="duo-card p-6 flex flex-col items-center text-center opacity-80">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-500 mb-3">
                  <Shield className="h-8 w-8 fill-sky-400" />
                </div>
                <h3 className="text-lg font-black">Streak Freeze</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 mb-4">
                  Protect your streak if you miss a day of practice.
                </p>
                <div className="mt-auto w-full">
                  <button disabled className="btn-3d btn-3d-blue w-full py-3 text-xs opacity-60">
                    COMING SOON (200 GEMS)
                  </button>
                </div>
              </div>

              {/* 7 Days Premium */}
              <div className="duo-card p-6 flex flex-col items-center text-center border-2 border-purple-300 dark:border-purple-900/60 hover:border-purple-400 transition-all relative overflow-hidden">
                <span className="absolute top-2 right-2 rounded-full bg-purple-400 px-2 py-0.5 text-[9px] font-black text-purple-950 uppercase">NEW</span>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-500 mb-3">
                  <Sparkles className="h-8 w-8 fill-purple-400" />
                </div>
                <h3 className="text-lg font-black">7 Days Premium</h3>
                <p className="text-xs font-bold text-gray-500 mt-1 mb-4">
                  {user?.is_premium 
                    ? `Active until ${new Date(user.premium_until!).toLocaleDateString()}` 
                    : "Unlock all units and learn without limits!"}
                </p>
                <div className="mt-auto w-full">
                  <button
                    onClick={async () => {
                      try {
                        soundFX.playClick();
                        const res = await api.buyPremium();
                        await loadUser();
                        soundFX.playCorrect();
                        showAlert(res.message, "Premium Activated!", "success");
                      } catch (error: any) {
                        soundFX.playWrong();
                        showAlert(error.message || "Failed to buy premium", "Purchase Error", "error");
                      }
                    }}
                    className="btn-3d btn-3d-purple w-full py-3 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Gem className="h-4 w-4 fill-sky-300" /> 500 GEMS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar user={user} />
      </div>

      <RefillModal
        isOpen={isRefillOpen}
        onClose={() => setIsRefillOpen(false)}
        onConfirmRefill={handleRefillConfirm}
        userGems={user?.gems || 0}
      />
      <CustomAlertModal
        isOpen={!!alertOptions}
        onClose={() => setAlertOptions(null)}
        options={alertOptions}
      />
    </div>
  );
}
