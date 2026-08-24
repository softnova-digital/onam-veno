import Image from "next/image";

// Our own Maveli, in a gold medallion. The file lives at public/maveli.webp -
// drop a different photo in at the same path to swap him out.
export default function MaveliPhoto({ className }) {
  return (
    <div className={`medallion${className ? ` ${className}` : ""}`}>
      <Image
        className="medallion__img"
        src="/maveli.webp"
        alt="Maveli"
        width={900}
        height={900}
        priority
        sizes="(max-width: 720px) 60vw, 260px"
      />
      <span className="medallion__ring" aria-hidden="true" />
    </div>
  );
}
