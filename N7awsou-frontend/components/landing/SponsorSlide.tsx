"use client";

import Image from "next/image";

const sponsors = [
  { src: "/Air-Alger.png", alt: "Sponsor 1" },
  { src: "/images (1).jfif", alt: "Sponsor 2" },
  { src: "/Air-Alger.png", alt: "Sponsor 3" },
  { src: "/images (1).jfif", alt: "Sponsor 4" },
];

export default function SponsorSlider() {
  return (
    <div className="overflow-hidden py-8 bg-white w-full">
      <div className="flex animate-slide whitespace-nowrap space-x-12">
        {/* Duplicate row for seamless infinite scroll */}
        {[...Array(2)].map((_, index) => (
          <div key={index} className="flex space-x-12">
            {sponsors.map((sponsor, i) => (
              <Image
                key={i}
                src={sponsor.src}
                alt={sponsor.alt}
                width={120}
                height={60}
                className="object-contain grayscale hover:grayscale-0 transition duration-300"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
