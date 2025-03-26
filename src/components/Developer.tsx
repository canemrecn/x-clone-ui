// src/components/Developer.tsx
"use client";

import Image from "next/image";
import React, { useState } from "react";

const skills = [
  { name: "HTML5", icon: "/icons/html5.png" },
  { name: "CSS3", icon: "/icons/css3.png" },
  { name: "JAVASCRIPT", icon: "/icons/js.png" },
  { name: "TYPESCRIPT", icon: "/icons/typescript.png" },
  { name: "REACT.JS", icon: "/icons/react.png" },
  { name: "NEXT.JS", icon: "/icons/nextjs.png" },
  { name: "MySQL", icon: "/icons/mysql.png" },
  { name: "JAVA", icon: "/icons/java.png" },
  { name: "PYTHON", icon: "/icons/python.png" },
  { name: "WORDPRESS", icon: "/icons/wordpress.png" },
];

const Developer = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFCF2] via-[#A8DBF0] to-[#BDC4BF] p-5 flex flex-col items-center justify-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black">About the Developer</h1>
      </header>

      <div className="flex flex-col items-center">
        <img
          src="/icons/ben2.png"
          alt="Developer Avatar"
          className="w-32 h-32 rounded-full mb-4 border-4 border-[#3E6A8A] shadow-lg"
        />
        <h1 className="text-3xl font-bold text-black mb-2">
          Emrecan Zeytünlü
        </h1>

        <div className="mt-4 w-full">
          <h2 className="text-2xl font-bold text-black mb-4 text-center">
            Abilities
          </h2>
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 mb-2 bg-[#FAFCF2] p-2 rounded-lg shadow-md"
              style={{
                animation: `${index % 2 === 0 ? "slideInLeft" : "slideInRight"} 0.8s forwards`,
                animationDelay: `${0.6 + index * 0.3}s`,
              }}
            >
              <img src={skill.icon} alt={`${skill.name} icon`} className="w-6 h-6" />
              <p className="text-lg font-medium text-black">{skill.name}</p>
            </div>
          ))}
        </div>

        <div className="flex space-x-6 mt-6">
          <a href="https://github.com/canemrecn" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <Image src={"/icons/github.png"} alt="GitHub" width={40} height={40} />
          </a>
          <a href="https://www.linkedin.com/in/emrecan-zeyt%C3%BCnl%C3%BC/" target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform">
            <Image src={"/icons/linkedin1.png"} alt="LinkedIn" width={40} height={40} />
          </a>
          <button onClick={() => setShowEmailModal(true)} className="hover:scale-110 transition-transform">
            <Image src={"/icons/mail.png"} alt="Email" width={40} height={40} />
          </button>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-[#3E6A8A] opacity-50" onClick={() => setShowEmailModal(false)}></div>
          <div className="relative bg-[#FAFCF2] text-black p-6 rounded-lg shadow-2xl">
            <h1 className="text-xl text-center font-bold">E-mail</h1>
            <p className="text-lg">emrecancnzytnl@gmail.com</p>
            <button
              onClick={() => setShowEmailModal(false)}
              className="mt-2 bg-[#A8DBF0] hover:bg-[#3E6A8A] text-black py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Developer;
