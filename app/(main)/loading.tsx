export default function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center
      bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">

      {/* Glass Card */}
      <div className="bg-slate-800/80 backdrop-blur-xl border border-white/10
        shadow-2xl rounded-2xl px-10 py-8 flex flex-col items-center gap-5">

        {/* Spinner */}
        <div
          className="w-14 h-14 rounded-full border-4
          border-[#A12124]/20 border-t-[#A12124]
          animate-spin"
        />

        {/* Text */}
        <div className="text-center">
          <h2 className="text-[#A12124] text-lg font-semibold tracking-wide">
            Loading...
          </h2>

          <p className="text-white/50 text-sm mt-1">
            Please wait while the page loads
          </p>
        </div>

      </div>
    </div>
  );
}