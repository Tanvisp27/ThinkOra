"use client";

import AuthModal from "@/components/AuthModal";

export default function RootPage() {
  // We just render the AuthModal forcefully open as the entire page.
  // It handles its own styling and logic internally.
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background glow for the whole page to match the vibe */}
      <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center -z-10 pointer-events-none">
        <div className="absolute w-[800px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute w-[600px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen opacity-50 translate-x-1/4 translate-y-1/4"></div>
      </div>
      
      {/* We pass a special prop or just rely on the component being fixed to the viewport */}
      <AuthModal 
        isOpen={true} 
        onClose={() => {}} // Can't be closed on the root page
        redirectOnSuccess="dynamic" // Dynamically redirect to /buyer or /seller
      />
    </div>
  );
}
