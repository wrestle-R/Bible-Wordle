import React from "react";
import { WarpBackground } from "../components/warp-background";
import Navbar from "../components/Navbar";
import { HyperText } from "../components/HyperText";
import AnimatedTextCycle from "../components/TextCycle";

export default function Landing() {
  const categories = ["Prophets", "Kings", "Places", "Events", "Characters"];

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <WarpBackground className="min-h-screen flex items-center justify-center pt-16">
        <div className="bg-black w-[500px] h-72 rounded-lg shadow-xl border border-gray-800 overflow-hidden">
          <div className="flex flex-col justify-center items-center text-center h-full gap-6 px-10">
            <HyperText
              text="BIBLE WORDLE"
              className="text-5xl font-bold pb-8 text-white tracking-tight"
              duration={1200}
            />
            <div className="flex gap-2 text-xl text-gray-300">
              <span>Master</span>
              <AnimatedTextCycle
                words={categories}
                interval={2000}
                className="text-purple-400"
              />
              <span>in Scripture</span>
            </div>
            <p className="text-lg text-gray-400 leading-relaxed font-light">
              Think you can guess today's biblical word in 6 tries?
            </p>
          </div>
        </div>
      </WarpBackground>
    </div>
  );
}