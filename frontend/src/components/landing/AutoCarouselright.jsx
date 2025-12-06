import { useRef, useEffect, useState } from "react";

export const AutoCarouselright = ({ images = [] }) => {
    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const slider = scrollRef.current;

        if (!slider) return;

        // Duplicate images for infinite loop
        const totalWidth = slider.scrollWidth / 2;

        const interval = setInterval(() => {
            if (!isPaused) {
                slider.scrollLeft -= 1;

                // When half way reached → reset to start
                if (slider.scrollLeft <= 0) {
                    slider.scrollLeft = totalWidth;
                }
            }
        }, 10);

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <div
            className="w-full overflow-hidden py-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar"
            >
                {[...images, ...images].map((img, i) => (
                    <div
                        key={i}
                        className="min-w-[200px] h-[300px] rounded-xl overflow-hidden shadow-md bg-white flex-shrink-0"
                    >
                        <img
                            src={img}
                            alt="carousel-img"
                            onError={(e) => (e.target.src = "/fallback.jpg")}
                            className="w-full h-full object-contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
